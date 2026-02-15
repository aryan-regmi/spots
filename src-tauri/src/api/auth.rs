use crate::{
    api::{self, ApiResult},
    AppState,
};
use argon2::{self, password_hash::SaltString, PasswordHasher};
use tauri::State;
use tauri_plugin_log::log;

#[derive(sqlx::FromRow)]
struct UserRecord {
    username: String,
    password: String,
    salt: String,
}

/// Validates the login to make sure the user exists and the username and password are in the
/// correct formats.
#[tauri::command]
pub async fn validate_login(
    state: State<'_, AppState>,
    username: &str,
    password: &str,
) -> ApiResult<bool> {
    // Make sure username and password are formatted correctly
    let username_formatted_correct =
        username.is_ascii() && username.len() > 0 && username.len() <= 64;
    let password_formatted_correct =
        password.is_ascii() && password.len() >= 8 && password.len() <= 128;

    // Make sure user exists in the db
    let state = state
        .try_lock()
        .map_err(|e| api::Response::error("DatabaseLockError", e.to_string()))?;
    let db = &state.db;
    let user: Option<UserRecord> = sqlx::query_as("SELECT * FROM users WHERE username = $1")
        .bind(username)
        .fetch_optional(db)
        .await
        .map_err(|e| api::Response::error("DatabaseQueryError", e.to_string()))?;
    drop(state);
    let user_exists = user.is_some() && user.as_ref().unwrap().username == username;

    // Make sure password matches stored password
    let passwords_match = if let Some(user) = user {
        // Get salt
        let salt = SaltString::from_b64(&user.salt)
            .map_err(|e| api::Response::error("InvalidSaltError", e.to_string()))?;

        // Hash password
        let hasher = argon2::Argon2::default();
        let hashed_password = hasher
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| api::Response::error("PasswordHasherError", e.to_string()))?
            .to_string();

        hashed_password == user.password
    } else {
        false
    };

    Ok(api::Response::success(
        username_formatted_correct && password_formatted_correct && user_exists && passwords_match,
    ))
}

/// Authenticates the login by setting the is_auth field in the database.
#[tauri::command]
pub async fn authenticate_login(state: State<'_, AppState>, username: &str) -> ApiResult<()> {
    log::info!("Authenticating user");
    let state = state
        .try_lock()
        .map_err(|e| api::Response::error("DatabaseLockError", e.to_string()))?;
    let db = &state.db;

    // Authenticate the user
    let query_result = sqlx::query("UPDATE users SET is_auth = $1 WHERE username = ?2")
        .bind(true)
        .bind(username)
        .execute(db)
        .await
        .map_err(|e| api::Response::error("DatabaseQueryError", e.to_string()))?;
    drop(state);
    assert_eq!(query_result.rows_affected(), 1);
    log::info!("User authenticated: {}", username);

    Ok(api::Response::success(()))
}

/// Unauthenticates the login by un-setting the is_auth field in the database.
#[tauri::command]
pub async fn unauthenticate_login(state: State<'_, AppState>) -> ApiResult<()> {
    log::info!("Unathenticating user");
    let state = state
        .try_lock()
        .map_err(|e| api::Response::error("DatabaseLockError", e.to_string()))?;
    let db = &state.db;

    // Unauthenticate the user
    let query_result = sqlx::query("UPDATE users SET is_auth = $1 WHERE is_auth = $2")
        .bind(false)
        .bind(true)
        .execute(db)
        .await
        .map_err(|e| api::Response::error("DatabaseQueryError", e.to_string()))?;
    drop(state);
    assert_eq!(query_result.rows_affected(), 1);
    log::info!("User unathenticated ");

    Ok(api::Response::success(()))
}
