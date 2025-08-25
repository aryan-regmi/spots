mod commands;
mod database;
// mod network;
mod net;

use crate::database::Database;
use commands::{auth, database as db};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize database
            tauri::async_runtime::block_on(async move {
                let handle = app.handle();
                let database = Database::new(&handle)
                    .await
                    .expect("failed to initialize database");

                // Store database pool in app state
                app.manage(database);

                Ok(())
            })
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            auth::hash_password,
            auth::verify_password,
            db::get_users,
            db::insert_user,
            db::get_auth_user,
            db::set_auth_user,
            db::remove_auth_user,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
