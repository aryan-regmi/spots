use argon2::{self, password_hash::SaltString, PasswordHasher};
use sqlx::{migrate::MigrateDatabase, sqlite::SqlitePoolOptions, Pool, Sqlite};
use tauri::{App, Manager, State};
use tokio::sync::Mutex;

type Res<T> = Result<T, String>;

/// Hashes the password.
#[tauri::command]
async fn hash_password(state: State<'_, AppState>, username: &str, password: &str) -> Res<String> {
    // Get salt from db
    let state = state.try_lock().map_err(|e| e.to_string())?;
    let db = &state.db;
    let salt: (String,) = sqlx::query_as("SELECT salt FROM users WHERE username = $1")
        .bind(username)
        .fetch_one(db)
        .await
        .map_err(|e| e.to_string())?;
    let salt = SaltString::from_b64(&salt.0).map_err(|e| e.to_string())?;
    drop(state);

    // Hash password
    let hasher = argon2::Argon2::default();
    let hashed_password = hasher
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| e.to_string())?
        .to_string();

    Ok(hashed_password)
}

/// Validates the login to make sure the user exists and the username and password are in the
/// correct formats.
#[tauri::command]
async fn validate_login(state: State<'_, AppState>, username: &str, password: &str) -> Res<bool> {
    // Make sure username is formatted correctly
    let username_formatted_correct =
        username.is_ascii() && username.len() > 0 && username.len() <= 64;
    let password_formatted_correct =
        password.is_ascii() && password.len() >= 8 && password.len() <= 128;

    // Make sure user exists in the db
    let state = state.try_lock().map_err(|e| e.to_string())?;
    let db = &state.db;
    let username_query_result: Option<(String,)> =
        sqlx::query_as("SELECT username FROM users WHERE username = ?1")
            .bind(username)
            .fetch_optional(db)
            .await
            .map_err(|e| e.to_string())?;
    let user_exists =
        username_query_result.is_some() && username_query_result.unwrap().0 == username;
    drop(state);

    Ok(username_formatted_correct && password_formatted_correct && user_exists)
}

/// Authenticates the login by checking its hashes against those in the database.
#[tauri::command]
fn authenticate_login(hashed_username: &str, hashed_password: &str) {
    // TODO:
    //  - Check against database for the user
    //  - Return true if it exists and the hashes are equal
}

/// Sets up the sqlite database.
async fn setup_db(app: &App) -> Res<Pool<sqlx::Sqlite>> {
    // Open/create db path
    let mut path = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(path.clone()).map_err(|e| e.to_string())?;
    path.push("spots-db.sqlite");
    let db_url = path
        .to_str()
        .ok_or_else(|| String::from("Invalid database URL"))?;

    // Create database
    Sqlite::create_database(&format!("sqlite:{}", db_url))
        .await
        .map_err(|e| e.to_string())?;

    // Connect to database
    let db = SqlitePoolOptions::new()
        .connect(db_url)
        .await
        .map_err(|e| e.to_string())?;

    // Apply migrations
    sqlx::migrate!("./migrations/")
        .run(&db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(db)
}

struct AppStateInner {
    db: Pool<Sqlite>,
}

type AppState = Mutex<AppStateInner>;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            hash_password,
            validate_login,
            authenticate_login
        ])
        .setup(|app| {
            tauri::async_runtime::block_on(async move {
                let db = setup_db(&app).await.expect("Database setup failed");
                app.manage(AppState::new(AppStateInner { db }))
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
