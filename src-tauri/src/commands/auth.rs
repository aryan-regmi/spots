use crate::{commands::DatabaseState, user::User, StringResult};

/// Sets the authenticated user.
#[tauri::command]
pub async fn set_auth_user(database: DatabaseState<'_>, user: User) -> StringResult<()> {
    database
        .set_auth_user(user)
        .await
        .map_err(|e| e.to_string())
}

/// Removes the authenticated user.
#[tauri::command]
pub async fn remove_auth_user(database: DatabaseState<'_>) -> StringResult<()> {
    database.remove_auth_user().await.map_err(|e| e.to_string())
}

/// Gets the currently authenticated user.
#[tauri::command]
pub async fn get_auth_user(database: DatabaseState<'_>) -> StringResult<Option<User>> {
    Ok(database.get_auth_user().await)
}
