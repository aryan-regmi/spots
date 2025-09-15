use crate::{database::Database, user::User, Result};
use sqlx::Row;

impl Database {
    /// Sets the authenticated user.
    pub async fn set_auth_user(&self, user: User) -> Result<()> {
        sqlx::query("UPDATE auth SET username = ? WHERE id = 1")
            .bind(user.username)
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
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| eprintln!("Database Error: {e}"))
        .ok()
        .flatten()
        .map(|record| User {
            id: record.get("id"),
            username: record.get("username"),
        });
        auth_user
    }
}
