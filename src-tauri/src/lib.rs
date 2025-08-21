use std::{fs, path::Path};

use rand::RngCore;
use tauri::{AppHandle, Manager};
use tauri_plugin_sql::{Migration, MigrationKind};

mod network;

/// Initalizes the Stronghold vault for the given username.
#[tauri::command]
async fn init_stronghold(app: AppHandle, username: String) -> Result<(), String> {
    // Setup paths
    let data_dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
    let salt_path = data_dir.join(format!("salt-{}.txt", username));

    // Generate salt if necessary
    generate_user_salt(&salt_path)?;

    // Register plugin
    let plugin = tauri_plugin_stronghold::Builder::with_argon2(&salt_path).build();
    app.plugin(plugin).map_err(|e| e.to_string())?;

    todo!()
}

fn generate_user_salt(path: &Path) -> Result<(), String> {
    if !path.exists() {
        let mut salt = [0u8; 32];
        rand::thread_rng().fill_bytes(&mut salt);
        fs::write(path, hex::encode(salt)).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations(
                    "sqlite:test.db", // TODO: Change to prod database (change name everywhere!)
                    vec![Migration {
                        version: 1,
                        description: "create users table",
                        sql: "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL);",
                        kind: MigrationKind::Up,
                    }],
                )
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![init_stronghold])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
