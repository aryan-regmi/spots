use argon2::{password_hash::SaltString, Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use rand::rngs::OsRng;

use crate::{commands::DatabaseState, user::User, StringResult};

/// Gets the user with the specified username from the database.
#[tauri::command]
pub async fn get_user_by_username(
    database: DatabaseState<'_>,
    username: String,
) -> StringResult<Option<User>> {
    Ok(database.get_user_by_username(&username).await)
}

/// Hashes the given password.
#[tauri::command]
pub fn hash_password(password: String) -> StringResult<String> {
    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| e.to_string())?
        .to_string();
    Ok(hash)
}

/// Verifies the given password against the one stored in the database for the user.
#[tauri::command]
pub async fn verify_password(
    database: DatabaseState<'_>,
    user_id: i64,
    password: String,
) -> StringResult<bool> {
    if let Some(hash) = database.get_password_hash(user_id).await {
        let parsed = PasswordHash::new(&hash).map_err(|e| e.to_string())?;
        Ok(Argon2::default()
            .verify_password(password.as_bytes(), &parsed)
            .is_ok())
    } else {
        Ok(false)
    }
}

/// Inserts a new user into the database.
#[tauri::command]
pub async fn insert_user(
    database: DatabaseState<'_>,
    username: String,
    password: String,
) -> StringResult<i64> {
    database
        .insert_user(username, password)
        .await
        .map_err(|e| e.to_string())
}
