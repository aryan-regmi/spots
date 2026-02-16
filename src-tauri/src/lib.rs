use tauri::Manager;
use tokio::sync::Mutex;

use crate::database::client::DatabaseClient;

mod database;
mod errors;
mod logger;

/// Result type for IPC.
pub type Res<T> = Result<T, String>;

/// The app state.
struct AppStateInner {
    db: DatabaseClient,
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
                let db = DatabaseClient::try_new(&app)
                    .await
                    .expect("Failed to setup database");
                app.manage(AppState::new(AppStateInner { db }));

                // Setup http server
                let config_http = RustlsConfig::from_pem_file(
                    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                        .join("certs")
                        .join("localhost.pem"),
                    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                        .join("certs")
                        .join("localhost-key.pem"),
                )
                .await
                .unwrap();
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
