mod commands;
mod database;
mod network;

use std::sync::Arc;

use crate::{database::Database, network::Network};
use commands::{auth, database as db, network as net};
use tauri::Manager;
use tokio::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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
            db::get_users,
            db::get_user,
            db::insert_user,
            db::get_auth_user,
            db::set_auth_user,
            db::remove_auth_user,
            net::create_new_endpoint,
            net::load_endpoint,
            net::get_endpoint_addr,
            net::close_endpoint,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
