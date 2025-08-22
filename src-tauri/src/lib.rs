// mod network;
mod migrations;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = migrations::migrations();

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:spots.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        // .invoke_handler(tauri::generate_handler![get_vault_password])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
