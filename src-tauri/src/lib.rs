use sqlx::{migrate::MigrateDatabase, sqlite::SqlitePoolOptions, Pool, Sqlite};
use tauri::{App, Manager};
use tokio::sync::Mutex;

mod api;
mod errors;
mod logger;

/// Result type for IPC.
pub(crate) type Res<T> = Result<T, String>;

/// Sets up the sqlite database.
#[tracing::instrument]
async fn setup_db(app: &App) -> Res<Pool<sqlx::Sqlite>> {
    // Open/create db path
    tracing::info!("Creating database path");
    let mut path = app.path().app_data_dir().map_err(|e| e.to_string())?;
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
    let db = SqlitePoolOptions::new()
        .connect(db_url)
        .await
        .map_err(|e| e.to_string())?;
    tracing::info!("Connected to database");

    // Apply migrations
    tracing::info!("Applying database migrations");
    sqlx::migrate!("./migrations/")
        .run(&db)
        .await
        .map_err(|e| e.to_string())?;
    tracing::info!("Migrations applied");

    Ok(db)
}

struct AppStateInner {
    db: Pool<Sqlite>,
}
type AppState = Mutex<AppStateInner>;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Setup tracing
    tracing_subscriber::fmt()
        .with_max_level(tracing::level_filters::LevelFilter::DEBUG)
        .init();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            logger::debug,
            logger::trace,
            logger::info,
            logger::warn,
            logger::error,
        ])
        .setup(|app| {
            tauri::async_runtime::block_on(async move {
                // Setup database
                let db = setup_db(&app).await.expect("Database setup failed");
                app.manage(AppState::new(AppStateInner { db }))
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
