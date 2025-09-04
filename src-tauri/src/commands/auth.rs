use argon2::{password_hash::SaltString, Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use rand::rngs::OsRng;
use tauri::State;

use crate::{
    database::{Database, User},
    DatabaseState,
};

type Result<T> = anyhow::Result<T, String>;

#[tauri::command]
pub fn hash_password(password: String) -> Result<String> {
    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| e.to_string())?
        .to_string();
    Ok(hash)
}

#[tauri::command]
pub async fn verify_password(
    database: State<'_, Database>,
    user_id: i64,
    password: String,
) -> Result<bool> {
    if let Some(hash) = database.get_password_hash(user_id).await {
        let parsed = PasswordHash::new(&hash).map_err(|e| e.to_string())?;
        Ok(Argon2::default()
            .verify_password(password.as_bytes(), &parsed)
            .is_ok())
    } else {
        Ok(false)
    }
}

#[tauri::command]
pub async fn get_auth_user(database: DatabaseState<'_>) -> Result<Option<User>> {
    Ok(database.get_auth_user().await)
}

#[tauri::command]
pub async fn set_auth_user(database: DatabaseState<'_>, username: String) -> Result<()> {
    database
        .set_auth_user(username)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn remove_auth_user(database: DatabaseState<'_>) -> Result<()> {
    database.remove_auth_user().await.map_err(|e| e.to_string())
}
