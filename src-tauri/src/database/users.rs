use crate::{database::Database, user::User};
use sqlx::Row;

impl Database {
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
}
