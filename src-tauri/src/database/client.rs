use sqlx::{migrate::MigrateDatabase, sqlite::SqlitePoolOptions, Pool, Sqlite};
use tauri::{App, Manager};

/// The database client.
pub struct DatabaseClient {
    pub(crate) pool: Pool<Sqlite>,
}

impl DatabaseClient {
    /// Sets up the sqlite database.
    #[tracing::instrument]
    pub async fn try_new(app: &App) -> Result<Self, String> {
        // Open/create db path
        tracing::info!("Creating database path");
        let mut path = app.path().app_data_dir().map_err(|e| {
            tracing::error!("Unable to create path: {:?}", e);
            e.to_string()
        })?;
        std::fs::create_dir_all(path.clone()).map_err(|e| e.to_string())?;
        path.push("spots-db.sqlite");
        let db_url = path
            .to_str()
            .ok_or_else(|| String::from("Invalid database URL"))?;
        tracing::info!("Database path created");

        // Create database
        tracing::info!("Creating database");
        Sqlite::create_database(&format!("sqlite:{}", db_url))
            .await
            .map_err(|e| e.to_string())?;
        tracing::info!("Database created");

        // Connect to database
        tracing::info!("Connecting to database");
        let pool = SqlitePoolOptions::new()
            .connect(db_url)
            .await
            .map_err(|e| e.to_string())?;
        tracing::info!("Connected to database");

        // Apply migrations
        tracing::info!("Applying database migrations");
        sqlx::migrate!("./migrations/")
            .run(&pool)
            .await
            .map_err(|e| e.to_string())?;
        tracing::info!("Migrations applied");

        Ok(Self { pool })
    }
}
