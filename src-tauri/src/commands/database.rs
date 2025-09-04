use tauri::State;

use crate::database::{Database, User, UserId};

type Result<T> = anyhow::Result<T, String>;
type DatabaseState<'a> = State<'a, Database>;

#[tauri::command]
pub async fn get_user(database: DatabaseState<'_>, user_id: UserId) -> Result<Option<User>> {
    Ok(database.get_user(user_id).await)
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
