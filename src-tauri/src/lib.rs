use crate::{database::client::DatabaseClient, server::Server};
use tauri::{async_runtime::Mutex, Manager};

mod database;
mod errors;
mod handlers;
mod logger;
mod routes;
mod server;

/// Result type for IPC.
pub type Res<T> = Result<T, String>;

#[derive(Debug, Clone)]
pub struct ServerConfig {
    pub port: u64,
    pub jwt_secret: String,
    pub jwt_maxage_secs: i64,
}
impl ServerConfig {
    fn new() -> Self {
        let port = std::env::var("PORT")
            .expect("PORT must be set")
            .parse()
            .expect("Invalid value for PORT");
        let jwt_secret = std::env::var("JWT_SECRET_KEY").expect("JWT_SECRET_KEY must be set");
        let jwt_maxage_secs = std::env::var("JWT_MAXAGE_SECS")
            .expect("JWT_MAXAGE_SECS must be set")
            .parse()
            .expect("Invalid value for JWT_MAXAGE_SECS");

        Self {
            port,
            jwt_secret,
            jwt_maxage_secs,
        }
    }
}

/// The app state.
struct AppStateInner {
    db: DatabaseClient,
    config: ServerConfig,
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
                let config = ServerConfig::new();

                // Setup database
                let db = DatabaseClient::try_new(&app)
                    .await
                    .expect("Failed to setup database");

                // Setup http server
                Server::start(config.clone()).await;

                app.manage(AppState::new(AppStateInner { db, config }));
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
