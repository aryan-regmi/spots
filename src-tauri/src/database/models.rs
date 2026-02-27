use std::str::FromStr;

use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::{prelude::FromRow, sqlite::SqliteRow, Row};
use uuid::Uuid;

/// Represents a user.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    /// The user' ID.
    pub id: Uuid,

    /// The username.
    pub username: String,

    /// The user's hashed password.
    pub password_hash: String,

    /// Timestamp for when the user was created.
    pub created_at: Option<NaiveDateTime>,

    /// Timestamp for when the user was last updated.
    pub updated_at: Option<NaiveDateTime>,
}

impl<'r> FromRow<'r, SqliteRow> for User {
    fn from_row(row: &'r SqliteRow) -> Result<Self, sqlx::Error> {
        let id: &str = row.try_get("id")?;
        let username: String = row.try_get("username")?;
        let password_hash: String = row.try_get("password_hash")?;
        let created_at: Option<&str> = row.try_get("created_at")?;
        let updated_at: Option<&str> = row.try_get("created_at")?;
        Ok(Self {
            id: Uuid::from_str(id).map_err(|e| sqlx::error::Error::Decode(e.into()))?,
            username,
            password_hash,
            created_at: created_at
                .map(|t| NaiveDateTime::from_str(&t).ok())
                .flatten(),
            updated_at: updated_at
                .map(|t| NaiveDateTime::from_str(&t).ok())
                .flatten(),
        })
    }
}

/// Contains all database models for the music library.
pub mod music_library {
    use std::str::FromStr;

    use chrono::NaiveDateTime;
    use serde::{Deserialize, Serialize};
    use sqlx::{sqlite::SqliteRow, FromRow, Row};
    use uuid::Uuid;

    /// Represents an audio track.
    #[derive(Debug, Serialize, Deserialize, Clone)]
    pub struct Track {
        /// The track's ID.
        pub id: Uuid,

        /// The user who uploaded this track.
        pub user_id: Option<Uuid>,

        /// Title of the track.
        pub title: String,

        /// The album this track belongs to.
        pub album_id: Option<Uuid>,

        /// The track number of this track (in its album).
        pub track_number: Option<i64>,

        /// The year this track was released.
        pub release_year: Option<i64>,

        /// The duration of the track in seconds.
        pub duration_secs: Option<i64>,

        /// The path to the actual track.
        pub file_path: String,

        /// The path to the thumbnail/image for track.
        pub thumbnail_path: String,

        /// Timestamp for when the track was created.
        pub created_at: NaiveDateTime,

        /// Timestamp for when the track was last updated.
        pub updated_at: NaiveDateTime,

        /// Timestamp for when the track was last played.
        pub last_played_at: Option<NaiveDateTime>,
    }

    impl<'r> FromRow<'r, SqliteRow> for Track {
        fn from_row(row: &'r SqliteRow) -> Result<Self, sqlx::Error> {
            let id: &str = row.try_get("id")?;
            let user_id: Option<&str> = row.try_get("user_id")?;
            let title: String = row.try_get("title")?;
            let album_id: Option<&str> = row.try_get("album_id")?;
            let track_number: Option<i64> = row.try_get("track_number")?;
            let release_year: Option<i64> = row.try_get("release_year")?;
            let duration_secs: Option<i64> = row.try_get("duration_secs")?;
            let file_path: String = row.try_get("file_path")?;
            let thumbnail_path: String = row.try_get("thumbnail_path")?;
            let created_at: &str = row.try_get("created_at")?;
            let updated_at: &str = row.try_get("updated_at")?;
            let last_played_at: Option<&str> = row.try_get("last_played_at")?;

            Ok(Self {
                id: Uuid::from_str(id).map_err(|e| sqlx::Error::Decode(e.into()))?,
                user_id: user_id.map(|id| Uuid::from_str(id).ok()).flatten(),
                title,
                album_id: album_id.map(|id| Uuid::from_str(id).ok()).flatten(),
                track_number,
                release_year,
                duration_secs,
                file_path,
                thumbnail_path,
                created_at: NaiveDateTime::from_str(created_at)
                    .map_err(|e| sqlx::Error::Decode(e.into()))?,
                updated_at: NaiveDateTime::from_str(updated_at)
                    .map_err(|e| sqlx::Error::Decode(e.into()))?,
                last_played_at: last_played_at
                    .map(|t| NaiveDateTime::from_str(t).ok())
                    .flatten(),
            })
        }
    }

    /// Represents an artist.
    #[derive(Debug, Serialize, Deserialize, Clone)]
    pub struct Artist {
        /// The artist's ID.
        pub id: Uuid,

        /// The artist's name.
        pub name: String,
    }

    impl<'r> FromRow<'r, SqliteRow> for Artist {
        fn from_row(row: &'r SqliteRow) -> Result<Self, sqlx::Error> {
            let id: &str = row.try_get("id")?;
            let name: String = row.try_get("name")?;
            Ok(Self {
                id: Uuid::from_str(id).map_err(|e| sqlx::Error::Decode(e.into()))?,
                name,
            })
        }
    }

    /// Represents a music genre.
    #[derive(Debug, Serialize, Deserialize, Clone)]
    pub struct Genre(pub String);

    impl<'r> FromRow<'r, SqliteRow> for Genre {
        fn from_row(row: &'r SqliteRow) -> Result<Self, sqlx::Error> {
            let name: String = row.try_get("name")?;
            Ok(Self(name))
        }
    }

    /// Represents a music album (artist defined collection of tracks).
    #[derive(Debug, Serialize, Deserialize, Clone)]
    pub struct Album {
        /// The album's ID.
        pub id: Uuid,

        /// The album's title.
        pub title: String,

        /// The path to the thumbnail/image for the album.
        pub thumbnail_path: String,
    }

    impl<'r> FromRow<'r, SqliteRow> for Album {
        fn from_row(row: &'r SqliteRow) -> Result<Self, sqlx::Error> {
            let id: &str = row.try_get("id")?;
            let title: String = row.try_get("title")?;
            let thumbnail_path: String = row.try_get("thumbnail_path")?;
            Ok(Self {
                id: Uuid::from_str(id).map_err(|e| sqlx::Error::Decode(e.into()))?,
                title,
                thumbnail_path,
            })
        }
    }

    /// Represents a playlist (user made collection of tracks).
    #[derive(Debug, Serialize, Deserialize, Clone)]
    pub struct Playlist {
        /// The playlist's ID.
        pub id: Uuid,

        /// The ID of the user who created this playlist.
        pub user_id: Option<Uuid>,

        /// The title of the playlist.
        pub title: String,

        /// The path to the thumbnail/image for the playlist.
        pub thumbnail_path: String,

        /// Timestamp for when the playlist was created.
        pub created_at: NaiveDateTime,

        /// Timestamp for when the playlist was last updated.
        pub updated_at: NaiveDateTime,

        /// Timestamp for when the playlist was last played.
        pub last_played_at: Option<NaiveDateTime>,
    }

    impl<'r> FromRow<'r, SqliteRow> for Playlist {
        fn from_row(row: &'r SqliteRow) -> Result<Self, sqlx::Error> {
            let id: &str = row.try_get("id")?;
            let user_id: Option<&str> = row.try_get("user_id")?;
            let title: String = row.try_get("title")?;
            let thumbnail_path: String = row.try_get("thumbnail_path")?;
            let created_at: &str = row.try_get("created_at")?;
            let updated_at: &str = row.try_get("updated_at")?;
            let last_played_at: Option<&str> = row.try_get("last_played_at")?;
            Ok(Self {
                id: Uuid::from_str(id).map_err(|e| sqlx::Error::Decode(e.into()))?,
                user_id: user_id.map(|uid| Uuid::from_str(uid).ok()).flatten(),
                title,
                thumbnail_path,
                created_at: NaiveDateTime::from_str(created_at)
                    .map_err(|e| sqlx::Error::Decode(e.into()))?,
                updated_at: NaiveDateTime::from_str(updated_at)
                    .map_err(|e| sqlx::Error::Decode(e.into()))?,
                last_played_at: last_played_at
                    .map(|t| NaiveDateTime::from_str(t).ok())
                    .flatten(),
            })
        }
    }
}
