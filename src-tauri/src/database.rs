use anyhow::{anyhow, Error, Result};
use serde::Serialize;
use sqlx::{
    sqlite::{SqliteConnectOptions, SqliteJournalMode},
    Pool, Row, Sqlite, SqlitePool,
};
use tauri::{AppHandle, Manager};
use tokio::fs;

use crate::network::{EncryptedValue, EncryptedValueBincode, Peers, PeersBincode};

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
    // FIXME: Remove this and replace with things that get specific user instead!
    //
    /// Gets all the users from the database.
    pub async fn get_users(&self) -> Result<Vec<User>> {
        let users = sqlx::query("SELECT id, username FROM users")
            .fetch_all(&self.pool)
            .await?
            .iter()
            .map(|row| User {
                id: row.get("id"),
                username: row.get("username"),
            })
            .collect::<Vec<_>>();
        Ok(users)
    }

    /// Gets the user with the specified username from the database.
    pub async fn get_user(&self, username: String) -> Result<Option<User>> {
        let user = sqlx::query("SELECT id, username FROM users WHERE username = ?")
            .bind(username)
            .fetch_optional(&self.pool)
            .await?
            .map(|result| User {
                id: result.get("id"),
                username: result.get("username"),
            });
        Ok(user)
    }

    /// Gets the user ID for the given username.
    pub async fn get_user_id(&self, username: String) -> Result<Option<u32>> {
        let result = sqlx::query("SELECT id FROM users WHERE username = ?")
            .bind(username)
            .fetch_optional(&self.pool)
            .await?
            .map(|user| user.get("id"));
        Ok(result)
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
    pub async fn get_password_hash(&self, username: String) -> Result<Option<String>> {
        Ok(sqlx::query("SELECT password FROM users WHERE username = ?")
            .bind(username.clone())
            .fetch_optional(&self.pool)
            .await?
            .map(|user| user.get("password")))
    }
}

/// Methods for the `auth` table.
impl Database {
    /// Gets the currently authenticated user.
    pub async fn get_auth_user(&self) -> Result<AuthUser> {
        let auth_record = sqlx::query("SELECT username FROM auth LIMIT 1")
            .fetch_one(&self.pool)
            .await?;
        let username: Option<String> = auth_record.get("username");
        let auth_user = username.map_or(AuthUser { username: None }, |username| AuthUser {
            username: Some(username),
        });
        Ok(auth_user)
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
    pub async fn get_secret_key(&self, username: String) -> Result<EncryptedValue> {
        let user_id = self
            .get_user_id(username.clone())
            .await?
            .ok_or_else(|| Error::from(anyhow!("{username} not found")))?;
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
    pub async fn set_secret_key(&self, username: String, secret_key: EncryptedValue) -> Result<()> {
        let secret_key_bytes = bincode::encode_to_vec(
            EncryptedValueBincode { value: secret_key },
            bincode::config::standard(),
        )?;
        let user_id = self
            .get_user_id(username.clone())
            .await?
            .ok_or_else(|| Error::from(anyhow!("{username} not found")))?;
        sqlx::query("INSERT INTO network (user_id, secret_key) VALUES (?,?)")
            .bind(user_id)
            .bind(secret_key_bytes)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    /// Gets the endpoint node address for the specified user.
    pub async fn get_endpoint_node(&self, username: String) -> Result<Option<String>> {
        let user_id = self
            .get_user_id(username.clone())
            .await?
            .ok_or_else(|| Error::from(anyhow!("{username} not found")))?;
        let result = sqlx::query("SELECT endpoint FROM network WHERE user_id = ?")
            .bind(user_id)
            .fetch_one(&self.pool)
            .await?;
        Ok(result.get("endpoint"))
    }

    /// Sets the endpoint node address for the specified user.
    pub async fn set_endpoint_node(
        &self,
        username: String,
        endpoint_address: String,
    ) -> Result<()> {
        let user_id = self
            .get_user_id(username.clone())
            .await?
            .ok_or_else(|| Error::from(anyhow!("{username} not found")))?;
        sqlx::query("UPDATE network SET endpoint = ? WHERE user_id = ?")
            .bind(endpoint_address)
            .bind(user_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    /// Gets the topic id for the specified user.
    pub async fn get_topic_id(&self, username: String) -> Result<Option<String>> {
        let user_id = self
            .get_user_id(username.clone())
            .await?
            .ok_or_else(|| Error::from(anyhow!("{username} not found")))?;
        let result = sqlx::query("SELECT topic_id FROM network WHERE user_id = ?")
            .bind(user_id)
            .fetch_one(&self.pool)
            .await?;
        Ok(result.get("topic_id"))
    }

    /// Sets the topic id for the specified user.
    pub async fn set_topic_id(&self, username: String, topic_id: String) -> Result<()> {
        let user_id = self
            .get_user_id(username.clone())
            .await?
            .ok_or_else(|| Error::from(anyhow!("{username} not found")))?;
        sqlx::query("UPDATE network SET topic_id = ? WHERE user_id = ?")
            .bind(topic_id)
            .bind(user_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    /// Gets the peers for the specified username.
    pub async fn get_peers(&self, username: String) -> Result<Peers> {
        let user_id = self
            .get_user_id(username.clone())
            .await?
            .ok_or_else(|| Error::from(anyhow!("{username} not found")))?;
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
    pub async fn set_peers(&self, username: String, peers: Peers) -> Result<()> {
        let peers_bytes =
            bincode::encode_to_vec(PeersBincode { peers }, bincode::config::standard())?;
        let user_id = self
            .get_user_id(username.clone())
            .await?
            .ok_or_else(|| Error::from(anyhow!("{username} not found")))?;
        sqlx::query("UPDATE network SET peers = ? WHERE user_id = ?")
            .bind(peers_bytes)
            .bind(user_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}

/// Represents a user in the database.
#[derive(Serialize)]
pub struct User {
    id: u32,
    username: String,
}

/// Represents an authenticated user.
#[derive(Serialize)]
pub struct AuthUser {
    username: Option<String>,
}
