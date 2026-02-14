use argon2::{self, password_hash::SaltString, PasswordHasher};
use sqlx::{migrate::MigrateDatabase, sqlite::SqlitePoolOptions, Pool, Sqlite};
use tauri::{App, Manager, State};
use tauri_plugin_log::log;
use tokio::sync::Mutex;

type Res<T> = Result<T, String>;

#[derive(sqlx::FromRow)]
struct UserRecord {
    username: String,
    password: String,
    salt: String,
}

/// Validates the login to make sure the user exists and the username and password are in the
/// correct formats.
#[tauri::command]
async fn validate_login(state: State<'_, AppState>, username: &str, password: &str) -> Res<bool> {
    // Make sure username and password are formatted correctly
    let username_formatted_correct =
        username.is_ascii() && username.len() > 0 && username.len() <= 64;
    let password_formatted_correct =
        password.is_ascii() && password.len() >= 8 && password.len() <= 128;

    // Make sure user exists in the db
    let state = state.try_lock().map_err(|e| e.to_string())?;
    let db = &state.db;
    let user: Option<UserRecord> = sqlx::query_as("SELECT * FROM users WHERE username = $1")
        .bind(username)
        .fetch_optional(db)
        .await
        .map_err(|e| e.to_string())?;
    drop(state);
    let user_exists = user.is_some() && user.as_ref().unwrap().username == username;

    // Make sure password matches stored password
    let passwords_match = if let Some(user) = user {
        // Get salt
        let salt = SaltString::from_b64(&user.salt).map_err(|e| e.to_string())?;

        // Hash password
        let hasher = argon2::Argon2::default();
        let hashed_password = hasher
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| e.to_string())?
            .to_string();

        hashed_password == user.password
    } else {
        false
    };

    Ok(username_formatted_correct && password_formatted_correct && user_exists && passwords_match)
}

/// Authenticates the login by setting the is_auth field in the database.
#[tauri::command]
async fn authenticate_login(state: State<'_, AppState>, username: &str) -> Res<()> {
    log::info!("Authenticating user");
    let state = state.try_lock().map_err(|e| e.to_string())?;
    let db = &state.db;

    // Authenticate the user
    let query_result = sqlx::query("UPDATE users SET is_auth = $1 WHERE username = ?2")
        .bind(true)
        .bind(username)
        .execute(db)
        .await
        .map_err(|e| e.to_string())?;
    drop(state);
    assert_eq!(query_result.rows_affected(), 1);
    log::info!("User authenticated: {}", username);

    Ok(())
}

/// Unauthenticates the login by un-setting the is_auth field in the database.
#[tauri::command]
async fn unauthenticate_login(state: State<'_, AppState>) -> Res<()> {
    log::info!("Unathenticating user");
    let state = state.try_lock().map_err(|e| e.to_string())?;
    let db = &state.db;

    // Unauthenticate the user
    let query_result = sqlx::query("UPDATE users SET is_auth = $1 WHERE is_auth = $2")
        .bind(false)
        .bind(true)
        .execute(db)
        .await
        .map_err(|e| e.to_string())?;
    drop(state);
    assert_eq!(query_result.rows_affected(), 1);
    log::info!("User unathenticated ");

    Ok(())
}

/// Sets up the sqlite database.
async fn setup_db(app: &App) -> Res<Pool<sqlx::Sqlite>> {
    // Open/create db path
    log::info!("Creating database path");
    let mut path = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(path.clone()).map_err(|e| e.to_string())?;
    path.push("spots-db.sqlite");
    let db_url = path
        .to_str()
        .ok_or_else(|| String::from("Invalid database URL"))?;
    log::info!("Database path created");

    // Create database
    log::info!("Creating database");
    Sqlite::create_database(&format!("sqlite:{}", db_url))
        .await
        .map_err(|e| e.to_string())?;
    log::info!("Database created");

    // Connect to database
    log::info!("Connecting to database");
    let db = SqlitePoolOptions::new()
        .connect(db_url)
        .await
        .map_err(|e| e.to_string())?;
    log::info!("Connected to database");

    // Apply migrations
    log::info!("Applying database migrations");
    sqlx::migrate!("./migrations/")
        .run(&db)
        .await
        .map_err(|e| e.to_string())?;
    log::info!("Migrations applied");

    Ok(db)
}

struct AppStateInner {
    db: Pool<Sqlite>,
}
type AppState = Mutex<AppStateInner>;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .clear_targets()
                .format(|out, message, record| {
                    let mut target = record.target();
                    if target.to_lowercase().contains("@tauri-apps_plugin-log.js") {
                        target = "spots_lib_frontend"
                    }

                    let timestamp = tauri_plugin_log::TimezoneStrategy::UseUtc
                        .get_now()
                        .format(
                            &tauri::webview::cookie::time::format_description::parse(
                                "[year]-[month]-[day] [hour]:[minute]:[second]",
                            )
                            .expect("Invalid time format"),
                        )
                        .expect("Invalid timestamp");

                    out.finish(format_args!(
                        "[{}][{}][{}] {}",
                        timestamp,
                        target,
                        record.level(),
                        message
                    ));
                })
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Stderr,
                ))
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Webview,
                ))
                .level(tauri_plugin_log::log::LevelFilter::Debug)
                .level_for("sqlx::query", log::LevelFilter::Error)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            validate_login,
            authenticate_login,
            unauthenticate_login
        ])
        .setup(|app| {
            tauri::async_runtime::block_on(async move {
                // Setup database
                let db = setup_db(&app).await.expect("Database setup failed");
                app.manage(AppState::new(AppStateInner { db }))
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
