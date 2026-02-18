use sqlx::{migrate::MigrateDatabase, sqlite::SqlitePoolOptions, Pool, Sqlite};
use tauri::{App, Manager};
use tracing::{info, span, Level};

/// The database client.
#[derive(Clone)]
pub struct DatabaseClient {
    pub(crate) pool: Pool<Sqlite>,
}

impl DatabaseClient {
    /// Sets up the sqlite database.
    pub async fn try_new(app: &App) -> Result<Self, String> {
        let span = span!(Level::TRACE, "DATABASE");
        let _guard = span.enter();

        // Open/create db path
        info!("Creating database path");
        let mut path = app.path().app_data_dir().map_err(|e| {
            tracing::error!("Unable to create path: {:?}", e);
            e.to_string()
        })?;
        std::fs::create_dir_all(path.clone()).map_err(|e| e.to_string())?;
        path.push("spots-db.sqlite");
        let db_url = path
            .to_str()
            .ok_or_else(|| String::from("Invalid database URL"))?;
        info!("Database path created");

        // Create database
        info!("Creating database");
        Sqlite::create_database(&format!("sqlite:{}", db_url))
            .await
            .map_err(|e| e.to_string())?;
        info!("Database created");

        // Connect to database
        info!("Connecting to database");
        let pool = SqlitePoolOptions::new()
            .connect(db_url)
            .await
            .map_err(|e| e.to_string())?;
        info!("Connected to database");

        // Apply migrations
        info!("Applying database migrations");
        sqlx::migrate!("./migrations/")
            .run(&pool)
            .await
            .map_err(|e| e.to_string())?;
        info!("Migrations applied");

        Ok(Self { pool })
    }
}
