use std::sync::Arc;

use tauri::Manager;
use tokio::sync::Mutex;

use crate::{database::Database, network::Network};

mod commands;
mod database;
mod network;
mod user;

pub type Result<T> = anyhow::Result<T>;

pub type StringResult<T> = anyhow::Result<T, String>;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

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
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::auth::set_auth_user,
            commands::auth::remove_auth_user,
            commands::auth::get_auth_user,
            commands::users::hash_password,
            commands::users::verify_password,
            commands::users::get_user_by_id,
            commands::users::get_user_by_username,
            commands::users::insert_user,
            commands::network::create_new_endpoint,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
