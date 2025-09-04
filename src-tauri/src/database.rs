use std::pin::Pin;

use futures::{stream::MapOk, Stream, TryStreamExt};
use serde::{Deserialize, Serialize};
use sqlx::{
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqliteQueryResult, SqliteRow},
    Pool, Row, Sqlite, SqlitePool,
};
use tauri::{AppHandle, Manager};
use tokio::fs;

use crate::{
    music::TrackMetadata,
    network::{EncryptedValue, EncryptedValueBincode, Peers, PeersBincode},
    Result,
};

// FIXME: Make all funcs take ids instead!

pub struct Database {
    pub pool: Pool<Sqlite>,
}

// TODO: Make all NULL-able values Option<>
//
// TODO: Make all `String` taking funcs take `&str` instead

impl Database {
    /// Initializes the database.
    pub async fn new(app_handle: &AppHandle) -> Result<Self> {
        // Open/setup database file
        let data_dir = app_handle.path().app_data_dir()?;
        if !data_dir.exists() {
            fs::create_dir_all(&data_dir).await?;
        }
        let db_path = data_dir.join("spots_user_data.db");
        std::env::set_var("DATABASE_URL", format!("sqlite://{}", db_path.display()));

        // Setup connection preferences w/ Write-Ahead Logging
        let conn_opts = SqliteConnectOptions::new()
            .filename(&db_path)
            .create_if_missing(true)
            .journal_mode(SqliteJournalMode::Wal);

        // Create pool with specified options
        let pool = SqlitePool::connect_with(conn_opts).await?;

        // Run migrations
        sqlx::migrate!("./migrations").run(&pool).await?;

        Ok(Self { pool })
    }
}

/// Methods for the `users` table.
impl Database {
    /// Gets the user with the specified id from the database.
    pub async fn get_user_by_id(&self, user_id: i64) -> Option<User> {
        let user = sqlx::query("SELECT id, username FROM users WHERE id = ?")
            .bind(user_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| eprintln!("{e}"))
            .ok()
            .map(|record| User {
                id: record.get("id"),
                username: record.get("username"),
            });
        user
    }

    /// Gets the user with the specified username from the database.
    pub async fn get_user_by_username(&self, username: &str) -> Option<User> {
        let user = sqlx::query("SELECT id, username FROM users WHERE username = ?")
            .bind(username)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| eprintln!("{e}"))
            .ok()
            .map(|record| User {
                id: record.get("id"),
                username: record.get("username"),
            });
        user
    }

    /// Gets the user by an identifier ([UserId]).
    pub async fn get_user(&self, identifier: UserId) -> Option<User> {
        let user = match identifier {
            UserId::Username(username) => self.get_user_by_username(&username).await,
            UserId::Id(user_id) => self.get_user_by_id(user_id).await,
        };
        user
    }

    /// Inserts the given user into the database, and returns the id of the inserted record.
    pub async fn insert_user(&self, username: String, password: String) -> Result<i64> {
        let result = sqlx::query("INSERT INTO users (username, password) VALUES (?, ?)")
            .bind(username)
            .bind(password)
            .execute(&self.pool)
            .await?;
        Ok(result.last_insert_rowid())
    }

    /// Gets the password hash for the specified user.
    pub async fn get_password_hash(&self, user_id: i64) -> Option<String> {
        let password_hash = sqlx::query("SELECT password FROM users WHERE user_id = ?")
            .bind(user_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| eprintln!("{e}"))
            .ok()
            .map(|record| record.get("password"));
        password_hash
    }
}

/// Methods for the `auth` table.
impl Database {
    /// Gets the currently authenticated user.
    pub async fn get_auth_user(&self) -> Option<User> {
        let auth_user = sqlx::query(
            "
            SELECT users.id, users.username
            FROM auth
            JOIN users ON users.username = auth.username
            WHERE auth.id = 1
            ",
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| eprintln!("{e}"))
        .ok()
        .map(|record| User {
            id: record.get("id"),
            username: record.get("username"),
        });
        auth_user
    }

    /// Sets the authenticated user.
    pub async fn set_auth_user(&self, username: String) -> Result<()> {
        sqlx::query("UPDATE auth SET username = ? WHERE id = 1")
            .bind(username)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    /// Removes the authenticated user.
    pub async fn remove_auth_user(&self) -> Result<()> {
        sqlx::query("UPDATE auth SET username = NULL WHERE id = 1")
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}

/// Methods for the `network` table.
impl Database {
    /// Gets the secret key for the specified user.
    pub async fn get_secret_key(&self, user_id: i64) -> Result<EncryptedValue> {
        let result = sqlx::query("SELECT secret_key FROM network WHERE user_id = ?")
            .bind(user_id)
            .fetch_one(&self.pool)
            .await?;
        let bytes: Vec<u8> = result.get("secret_key");
        let (encrypted_key, _): (EncryptedValueBincode, usize) =
            bincode::decode_from_slice(&bytes, bincode::config::standard())?;
        Ok(encrypted_key.value)
        // Err(Error::from(anyhow!("{username} not found")))
    }

    /// Sets the secret key for the specified user.
    pub async fn set_secret_key(&self, user_id: i64, secret_key: EncryptedValue) -> Result<()> {
        let secret_key_bytes = bincode::encode_to_vec(
            EncryptedValueBincode { value: secret_key },
            bincode::config::standard(),
        )?;
        sqlx::query("INSERT INTO network (user_id, secret_key) VALUES (?,?)")
            .bind(user_id)
            .bind(secret_key_bytes)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    /// Gets the endpoint node address for the specified user.
    pub async fn get_endpoint_node(&self, user_id: i64) -> Result<Option<String>> {
        let result = sqlx::query("SELECT endpoint FROM network WHERE user_id = ?")
            .bind(user_id)
            .fetch_one(&self.pool)
            .await?;
        Ok(result.get("endpoint"))
    }

    /// Sets the endpoint node address for the specified user.
    pub async fn set_endpoint_node(&self, user_id: i64, endpoint_address: String) -> Result<()> {
        sqlx::query("UPDATE network SET endpoint = ? WHERE user_id = ?")
            .bind(endpoint_address)
            .bind(user_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    /// Gets the network ID (ID field of the network table) for the specified user.
    pub async fn get_network_id(&self, user_id: i64) -> Result<u32> {
        let result = sqlx::query("SELECT id FROM network WHERE user_id = ?")
            .bind(user_id)
            .fetch_one(&self.pool)
            .await?;
        Ok(result.get("id"))
    }

    /// Gets the topic ID for the specified user.
    pub async fn get_topic_id(&self, user_id: i64) -> Result<Option<String>> {
        let result = sqlx::query("SELECT topic_id FROM network WHERE user_id = ?")
            .bind(user_id)
            .fetch_one(&self.pool)
            .await?;
        Ok(result.get("topic_id"))
    }

    /// Sets the topic id for the specified user.
    pub async fn set_topic_id(&self, user_id: i64, topic_id: String) -> Result<()> {
        sqlx::query("UPDATE network SET topic_id = ? WHERE user_id = ?")
            .bind(topic_id)
            .bind(user_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    /// Gets the peers for the specified username.
    pub async fn get_peers(&self, user_id: i64) -> Result<Peers> {
        let result = sqlx::query("SELECT peers FROM network where user_id = ?")
            .bind(user_id)
            .fetch_one(&self.pool)
            .await?;
        let bytes: Option<Vec<u8>> = result.get("peers");
        if let Some(bytes) = bytes {
            let (peers, _): (PeersBincode, usize) =
                bincode::decode_from_slice(&bytes, bincode::config::standard())?;
            Ok(peers.peers)
        } else {
            Ok(Peers { nodes: vec![] })
        }
    }

    /// Sets the peers for the specified username.
    pub async fn set_peers(&self, user_id: i64, peers: Peers) -> Result<()> {
        let peers_bytes =
            bincode::encode_to_vec(PeersBincode { peers }, bincode::config::standard())?;
        sqlx::query("UPDATE network SET peers = ? WHERE user_id = ?")
            .bind(peers_bytes)
            .bind(user_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}

/// Methods for the `tracks` table.
impl Database {
    /// Inserts the track in the database, associating it with the given user.
    pub async fn insert_track(
        &self,
        metadata: TrackMetadata,
        user_id: i64,
    ) -> Result<SqliteQueryResult> {
        let network_id = self.get_network_id(user_id).await?;
        let result = sqlx::query(
            "INSERT OR IGNORE INTO tracks (
                network_id,
                title,
                artist,
                album,
                genre,
                year,
                cover_base64,
                path
            ) VALUES (?,?,?,?,?,?,?,?)",
        )
        .bind(network_id)
        .bind(metadata.clone().title)
        .bind(metadata.clone().artist)
        .bind(metadata.clone().album)
        .bind(metadata.clone().genre)
        .bind(metadata.clone().year)
        .bind(metadata.clone().cover_base64)
        .bind(metadata.clone().path)
        .execute(&self.pool)
        .await?;

        Ok(result)
    }

    /// Returns a stream containing all of the tracks in the database.
    pub async fn stream_tracks(&self) -> MapOk<TrackStream, impl TrackMap> {
        sqlx::query(
            "
            SELECT id, title, artist, album, genre, year, cover_base64, path
            FROM tracks
            GROUP BY path
        ",
        )
        .fetch(&self.pool)
        .map_ok(|record| StreamedTrackMetadata {
            id: record.get("id"),
            metadata: TrackMetadata {
                title: record.get("title"),
                artist: record.get("artist"),
                album: record.get("album"),
                genre: record.get("genre"),
                year: record.get("year"),
                cover_base64: record.get("cover_base64"),
                path: record.get("path"),
            },
        })
    }
}

/// Methods for the `playlists` tables.
impl Database {
    /// Inserts the playlist in the database, associating it with the given user.
    pub async fn insert_playlist(&self, name: String, user_id: i64) -> Result<i64> {
        let network_id = self.get_network_id(user_id).await?;
        let result = sqlx::query(
            "
            INSERT INTO playlists (user_id, network_id, name) VALUES (?,?,?)
            ",
        )
        .bind(user_id)
        .bind(network_id)
        .bind(name)
        .execute(&self.pool)
        .await?;
        Ok(result.last_insert_rowid())
    }

    /// Adds the track to the specified playlist.
    pub async fn add_track_to_playlist(&self, track_id: i64, playlist_id: i64) -> Result<()> {
        sqlx::query("INSERT OR IGNORE INTO playlist_tracks (playlist_id, track_id) VALUES (?, ?)")
            .bind(playlist_id)
            .bind(track_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    // FIXME: Finish impl!
    //
    /// Returns a stream containing all of the playlists in the database.
    pub async fn stream_playlists(&self) -> () {
        // sqlx::query(
        //     "
        //     SELECT id, title, artist, album, genre, year, cover_base64, path
        //     FROM tracks
        //     GROUP BY path
        // ",
        // )
        // .fetch(&self.pool)
        // .map_ok(|record| StreamedTrackMetadata {
        //     id: record.get("id"),
        //     metadata: TrackMetadata {
        //         title: record.get("title"),
        //         artist: record.get("artist"),
        //         album: record.get("album"),
        //         genre: record.get("genre"),
        //         year: record.get("year"),
        //         cover_base64: record.get("cover_base64"),
        //         path: record.get("path"),
        //     },
        // })

        todo!()
    }
}

/// The track metadata along with the its ID.
#[derive(Serialize, Clone)]
pub struct StreamedTrackMetadata {
    pub id: i64,
    pub metadata: TrackMetadata,
}

/// A stream of [StreamedTrackMetadata].
pub type TrackStream =
    Pin<Box<dyn Stream<Item = std::result::Result<SqliteRow, sqlx::Error>> + std::marker::Send>>;

/// A function that converts a [SqliteRow] to a [StreamedTrackMetadata].
pub trait TrackMap: FnMut(sqlx::sqlite::SqliteRow) -> StreamedTrackMetadata {}
impl<F: FnMut(sqlx::sqlite::SqliteRow) -> StreamedTrackMetadata> TrackMap for F {}

/// Represents a user in the database.
#[derive(Serialize)]
pub struct User {
    id: u32,
    username: String,
}

/// Represents a user identifier.
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", tag = "type", content = "value")]
pub enum UserId {
    Id(i64),
    Username(String),
}
