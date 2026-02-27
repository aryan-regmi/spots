use std::sync::Arc;

use dotenvy::dotenv;
use tauri::{async_runtime::Mutex, Manager};
use tracing_subscriber::EnvFilter;

use crate::{api::utils::ApiConfig, database::client::DatabaseClient};

mod api;
mod database;
mod errors;
mod logger;

/// The app state.
#[derive(Clone)]
struct AppState {
    db: Arc<Mutex<DatabaseClient>>,
    api_config: Arc<Mutex<ApiConfig>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv().expect("Unable to load in environment variables.");

    // Setup tracing
    tracing_subscriber::fmt()
        .json()
        .with_target(true)
        .with_current_span(true)
        .with_span_list(true)
        .with_env_filter(EnvFilter::new(
            "spots_lib=trace,sqlx=error,sqlx::query=error",
        ))
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            logger::debug,
            logger::trace,
            logger::info,
            logger::warn,
            logger::error,
            api::auth::register_user,
            api::auth::login_user,
            api::music::get_playlist,
            api::music::get_playlist_tracks,
            api::music::get_pinned_playlists,
            api::music::get_all_playlists,
            api::music::get_track,
            api::music::get_favorited_tracks,
            api::music::get_track_artists,
            api::music::get_track_genres,
            api::music::get_all_tracks,
        ])
        .setup(|app| {
            tauri::async_runtime::block_on(async move {
                // Setup API
                let api_config = Arc::new(Mutex::new(ApiConfig::new()));

                // Setup database
                let db = DatabaseClient::try_new(&app)
                    .await
                    .expect("Failed to setup database");

                // Setup app state
                let db = Arc::new(Mutex::new(db));
                let app_state = AppState { db, api_config };
                app.manage(app_state);

                // Setup API
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
