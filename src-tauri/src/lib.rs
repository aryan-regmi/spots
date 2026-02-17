use std::sync::Arc;

use crate::{
    database::client::DatabaseClient,
    server::{Server, ServerConfig},
};
use dotenvy::dotenv;
use tauri::{async_runtime::Mutex, Manager};

mod database;
mod errors;
mod handlers;
mod logger;
mod middleware;
mod server;
mod utils;

/// The app state.
#[derive(Clone)]
struct AppState {
    db: Arc<Mutex<DatabaseClient>>,
    config: Arc<Mutex<ServerConfig>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv().expect("Unable to load in environment variables.");

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

                // Setup app state
                let db = Arc::new(Mutex::new(db));
                let config = Arc::new(Mutex::new(config));

                // Setup http server
                Server::start(AppState {
                    db: db.clone(),
                    config: config.clone(),
                })
                .await;

                // Manage state in Tauri
                app.manage(AppState { db, config });
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
