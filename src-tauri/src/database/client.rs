use sqlx::{migrate::MigrateDatabase, sqlite::SqlitePoolOptions, Pool, Sqlite};
use tauri::{App, Manager};
use tracing::{error, info, span, Level};

/// The database client.
#[derive(Clone)]
pub struct DatabaseClient {
    pub(crate) path: String,
    pub(crate) pool: Pool<Sqlite>,
}

impl DatabaseClient {
    /// Sets up the sqlite database.
    pub async fn try_new(app: &App) -> Result<Self, String> {
        let span = span!(Level::TRACE, "DatabaseClient");
        let _guard = span.enter();

        // Open/create db path
        let mut path = app.path().app_data_dir().map_err(|e| {
            error!(error = e.to_string(), "Unable to create database path");
            e.to_string()
        })?;
        std::fs::create_dir_all(path.clone()).map_err(|e| e.to_string())?;
        path.push("spots-db.sqlite");
        let db_url = path
            .to_str()
            .ok_or_else(|| String::from("Invalid database URL"))?;
        info!(path = db_url, "Database path created");

        // Create database
        info!(database = db_url, "Creating database");
        Sqlite::create_database(&format!("sqlite:{}", db_url))
            .await
            .map_err(|e| e.to_string())?;
        info!(database = db_url, "Database created");

        // Connect to database
        info!(database = db_url, "Connecting to database");
        let pool = SqlitePoolOptions::new()
            .connect(db_url)
            .await
            .map_err(|e| e.to_string())?;
        info!(database = db_url, "Connected to database");

        // Apply migrations
        info!(database = db_url, "Applying database migrations");
        sqlx::migrate!("./migrations/")
            .run(&pool)
            .await
            .map_err(|e| e.to_string())?;
        info!(database = db_url, "Migrations applied");

        Ok(Self {
            path: db_url.into(),
            pool,
        })
    }

    /// Returns a static version of the DB pool.
    pub fn leak_pool(&self) -> &'static Pool<Sqlite> {
        Box::leak(Box::new(self.pool.clone()))
    }
}
