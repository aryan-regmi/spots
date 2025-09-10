mod commands;
mod database;
mod music;
mod network;
mod utils;

pub use utils::*;

use std::sync::Arc;

use crate::{database::Database, network::Network};
use commands::{auth, database as db, music as msc, network as net};
use tauri::Manager;
use tokio::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            tauri::async_runtime::block_on(async move {
                let handle = app.handle();

                // Initialize database
                let database = Database::new(&handle)
                    .await
                    .expect("failed to initialize database");

                // Initialize net
                let net = Network::new();

                // Manage states
                app.manage(database);
                app.manage(Arc::new(Mutex::new(net)));

                Ok(())
            })
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            auth::hash_password,
            auth::verify_password,
            auth::get_auth_user,
            auth::set_auth_user,
            auth::remove_auth_user,
            db::get_user,
            db::insert_user,
            net::create_new_endpoint,
            net::load_endpoint,
            net::get_endpoint_addr,
            net::close_endpoint,
            msc::load_music_library,
            msc::stream_all_tracks,
            msc::stream_playlists,
            msc::stream_playlist_tracks,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
