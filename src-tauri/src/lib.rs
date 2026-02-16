use sqlx::{migrate::MigrateDatabase, sqlite::SqlitePoolOptions, Pool, Sqlite};
use tauri::{App, Manager};
use tauri_plugin_log::log;
use tokio::sync::Mutex;

mod api;

/// Result type for IPC.
pub(crate) type Res<T> = Result<T, String>;

/// Sets up the sqlite database.
async fn setup_db(app: &App) -> Res<Pool<sqlx::Sqlite>> {
    // Open/create db path
    log::info!("Creating database path");
    let mut path = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(path.clone()).map_err(|e| e.to_string())?;
    path.push("spots-db.sqlite");
    let db_url = path
        .to_str()
        .ok_or_else(|| String::from("Invalid database URL"))?;
    log::info!("Database path created");

    // Create database
    log::info!("Creating database");
    Sqlite::create_database(&format!("sqlite:{}", db_url))
        .await
        .map_err(|e| e.to_string())?;
    log::info!("Database created");

    // Connect to database
    log::info!("Connecting to database");
    let db = SqlitePoolOptions::new()
        .connect(db_url)
        .await
        .map_err(|e| e.to_string())?;
    log::info!("Connected to database");

    // Apply migrations
    log::info!("Applying database migrations");
    sqlx::migrate!("./migrations/")
        .run(&db)
        .await
        .map_err(|e| e.to_string())?;
    log::info!("Migrations applied");

    Ok(db)
}

struct AppStateInner {
    db: Pool<Sqlite>,
}
type AppState = Mutex<AppStateInner>;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .clear_targets()
                .format(|out, message, record| {
                    let mut target = record.target();
                    if target.to_lowercase().contains("@tauri-apps_plugin-log.js") {
                        target = "spots_lib_frontend"
                    }

                    let timestamp = tauri_plugin_log::TimezoneStrategy::UseUtc
                        .get_now()
                        .format(
                            &tauri::webview::cookie::time::format_description::parse(
                                "[year]-[month]-[day] [hour]:[minute]:[second]",
                            )
                            .expect("Invalid time format"),
                        )
                        .expect("Invalid timestamp");

                    out.finish(format_args!(
                        "[{}][{}][{}] {}",
                        timestamp,
                        target,
                        record.level(),
                        message
                    ));
                })
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Stderr,
                ))
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Webview,
                ))
                .level(tauri_plugin_log::log::LevelFilter::Debug)
                .level_for("sqlx::query", log::LevelFilter::Error)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            api::auth::get_auth_user,
            api::auth::validate_login,
            api::auth::authenticate_login,
            api::auth::unauthenticate_login,
            api::auth::create_login
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
