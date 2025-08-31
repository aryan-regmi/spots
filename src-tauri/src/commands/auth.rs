use argon2::{password_hash::SaltString, Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use rand::rngs::OsRng;
use tauri::State;

use crate::database::Database;

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
    username: String,
    password: String,
) -> Result<bool> {
    let hash = match database.get_password_hash(username).await {
        Ok(hash) => hash,
        Err(err) => {
            eprintln!("{err}");
            return Ok(false);
        }
    };
    let parsed = PasswordHash::new(&hash).map_err(|e| e.to_string())?;
    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok())
}
