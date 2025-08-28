use tauri::State;

use crate::database::{AuthUser, Database, User};

type Result<T> = anyhow::Result<T, String>;
type DatabaseState<'a> = State<'a, Database>;

#[tauri::command]
pub async fn get_users(database: DatabaseState<'_>) -> Result<Vec<User>> {
    database.get_users().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_user(database: DatabaseState<'_>, username: String) -> Result<Option<User>> {
    database.get_user(username).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn insert_user(
    database: DatabaseState<'_>,
    username: String,
    password: String,
) -> Result<i64> {
    database
        .insert_user(username, password)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_auth_user(database: DatabaseState<'_>) -> Result<AuthUser> {
    database.get_auth_user().await.map_err(|e| e.to_string())
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
