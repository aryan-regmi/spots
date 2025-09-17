use crate::{database::Database, user::User, Result};
use sqlx::Row;

impl Database {
    /// Gets the user with the specified ID from the database.
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
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| eprintln!("{e}"))
            .ok()
            .flatten()
            .map(|record| User {
                id: record.get("id"),
                username: record.get("username"),
            });
        user
    }

    /// Inserts the given user into the database, and returns the id of the inserted record.
    pub async fn insert_user(&self, username: &str, password: &str) -> Result<i64> {
        let result = sqlx::query("INSERT INTO users (username, password) VALUES (?, ?)")
            .bind(username)
            .bind(password)
            .execute(&self.pool)
            .await?;
        Ok(result.last_insert_rowid())
    }

    /// Gets the password hash for the specified user.
    pub async fn get_password_hash(&self, user_id: i64) -> Option<String> {
        let password_hash = sqlx::query("SELECT password FROM users WHERE id = ?")
            .bind(user_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| eprintln!("{e}"))
            .ok()
            .map(|record| record.get("password"));
        password_hash
    }
}
