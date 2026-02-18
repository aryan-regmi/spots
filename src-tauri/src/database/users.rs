use chrono::Utc;
use uuid::Uuid;

use crate::database::{client::DatabaseClient, models::User};

/// Represents user operations.
pub trait UserExt {
    /// Gets the specified user.
    async fn get_user(
        &self,
        user_id: Option<Uuid>,
        username: Option<&str>,
    ) -> Result<Option<User>, sqlx::Error>;

    /// Creates a new user.
    async fn create_user(
        &self,
        username: impl Into<String>,
        password_hash: impl Into<String>,
    ) -> Result<User, sqlx::Error>;

    /// Updates the user's username.
    async fn update_username(
        &self,
        user_id: Uuid,
        new_username: impl Into<String>,
    ) -> Result<User, sqlx::Error>;

    /// Updates the user's password hash.
    async fn update_password_hash(
        &self,
        user_id: Uuid,
        new_password_hash: impl Into<String>,
    ) -> Result<User, sqlx::Error>;
}

impl UserExt for DatabaseClient {
    async fn get_user(
        &self,
        user_id: Option<Uuid>,
        username: Option<&str>,
    ) -> Result<Option<User>, sqlx::Error> {
        let user: Option<User> = sqlx::query_as(
            r#"
            SELECT *
            FROM users
            WHERE
                ($1::text IS NULL OR id = $1) AND
                ($2::text IS NULL OR username = $2)
            "#,
        )
        .bind(user_id.map(|uid| uid.to_string()))
        .bind(username)
        .fetch_optional(&self.pool)
        .await?;

        Ok(user)
    }

    async fn create_user(
        &self,
        username: impl Into<String>,
        password_hash: impl Into<String>,
    ) -> Result<User, sqlx::Error> {
        let user_id = Uuid::new_v4();
        let created_at = Utc::now().naive_local();
        let updated_at = Utc::now().naive_local();
        let user: User = sqlx::query_as(
            r#"
            INSERT INTO users (
                id,
                username,
                password_hash,
                created_at,
                updated_at,
            ) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING 
                id,
                username,
                password_hash,
                created_at,
                updated_at,
            "#,
        )
        .bind(user_id.to_string())
        .bind(username.into())
        .bind(password_hash.into())
        .bind(created_at.to_string())
        .bind(updated_at.to_string())
        .bind(false)
        .fetch_one(&self.pool)
        .await?;

        Ok(user)
    }

    async fn update_username(
        &self,
        user_id: Uuid,
        new_username: impl Into<String>,
    ) -> Result<User, sqlx::Error> {
        let updated_at = Utc::now().naive_local();
        let user: User = sqlx::query_as(
            r#"
            UPDATE users 
            SET username = $1, updated_at = $2
            WHERE id = $3
            RETURNING 
                id,
                username,
                password_hash,
                created_at,
                updated_at,
            "#,
        )
        .bind(new_username.into())
        .bind(updated_at.to_string())
        .bind(user_id.to_string())
        .fetch_one(&self.pool)
        .await?;

        Ok(user)
    }

    async fn update_password_hash(
        &self,
        user_id: Uuid,
        new_password_hash: impl Into<String>,
    ) -> Result<User, sqlx::Error> {
        let updated_at = Utc::now().naive_local();
        let user: User = sqlx::query_as(
            r#"
            UPDATE users 
            SET password_hash = $2, updated_at = $3
            WHERE id = $1
            RETURNING 
                id,
                username,
                password_hash,
                created_at,
                updated_at,
            "#,
        )
        .bind(user_id.to_string())
        .bind(new_password_hash.into())
        .bind(updated_at.to_string())
        .fetch_one(&self.pool)
        .await?;

        Ok(user)
    }
}
