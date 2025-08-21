use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};

// mod network;

// FIXME: Do this dynamically during prod
#[tauri::command]
fn get_vault_password() -> String {
    std::env::var("SPOTS_VAULT_PASSWORD").expect("Invalid variable")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = 
    vec![
        Migration {
            version: 1,
            description: "create users table",
            sql: "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "removed passwords",
            sql: "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "new table",
            sql: "DROP TABLE users; CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE);",
            kind: MigrationKind::Up,
        }
    ];
    
    tauri::Builder::default()
        .setup(|app| {
            let salt_path = app.path().app_local_data_dir()?.join("salt.txt");
            app.handle()
                .plugin(tauri_plugin_stronghold::Builder::with_argon2(&salt_path).build())?;
            Ok(())
        })
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations(
                    "sqlite:test.db", // TODO: Change to prod database (change name everywhere!)
                    migrations,
                )
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_vault_password])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

