use crate::{commands::DatabaseState, user::User, StringResult};

/// Gets the user with the specified username from the database.
#[tauri::command]
pub async fn get_user_by_username(
    database: DatabaseState<'_>,
    username: String,
) -> StringResult<Option<User>> {
    Ok(database.get_user_by_username(&username).await)
}
