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

    /// If the user is currently authenticated or not.
    pub is_auth: bool,
}

impl<'r> FromRow<'r, SqliteRow> for User {
    fn from_row(row: &'r SqliteRow) -> Result<Self, sqlx::Error> {
        let id: &str = row.try_get("id")?;
        let username: String = row.try_get("username")?;
        let password_hash: String = row.try_get("password_hash")?;
        let created_at: Option<&str> = row.try_get("created_at")?;
        let updated_at: Option<&str> = row.try_get("created_at")?;
        let is_auth: bool = row.try_get("is_auth")?;
        Ok(Self {
            id: Uuid::from_str(id).map_err(|e| sqlx::error::Error::Decode(e.into()))?,
            username,
            password_hash,
            created_at: created_at
                .map(|t| NaiveDateTime::from_str(&t).expect("Invalid `created at` date")),
            updated_at: updated_at
                .map(|t| NaiveDateTime::from_str(&t).expect("Invalid `updated at` date")),
            is_auth,
        })
    }
}
