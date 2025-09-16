mod auth;
mod network;
mod users;

use sqlx::{
    sqlite::{SqliteConnectOptions, SqliteJournalMode},
    Pool, Sqlite, SqlitePool,
};
use tauri::{AppHandle, Manager};
use tokio::fs;

use crate::Result;

/// The sqlite database.
pub struct Database {
    pub pool: Pool<Sqlite>,
}

impl Database {
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
