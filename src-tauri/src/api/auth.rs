use serde::Deserialize;
use tauri::State;
use validator::Validate;

use crate::{
    api::{
        dtos::{FilterUserDto, LoginUserDto, LoginUserResponseDto, RegisterUserDto},
        utils::{
            password::{compare_password, hash_password},
            token::Token,
            ApiResponse, ApiResponseStatus, ApiResult,
        },
    },
    database::users::UserExt,
    errors::SpotsError,
    AppState,
};

/// Registers the specified user.
#[tauri::command]
async fn register_user(state: State<'_, AppState>, user: RegisterUserDto) -> ApiResult<()> {
    // Validate user
    user.validate()
        .map_err(|e| SpotsError::ValidationError(e.to_string()))?;

    // Hash the password
    let hashed_password = hash_password(user.password)?;

    // Create new user in DB
    let create_user_result = state
        .db
        .lock()
        .await
        .create_user(user.username, hashed_password)
        .await;

    create_user_result
        .map(|_| ApiResponse {
            status: ApiResponseStatus::Success,
            value: (),
        })
        .map_err(|e| SpotsError::DatabaseError(e.to_string()))
}

/// Logs in the specified user.
#[tauri::command]
async fn login_user(
    state: State<'_, AppState>,
    user: LoginUserDto,
) -> ApiResult<LoginUserResponseDto> {
    // Validate user
    user.validate()
        .map_err(|e| SpotsError::ValidationError(e.to_string()))?;

    // Get user from DB
    let existing_user = state
        .db
        .lock()
        .await
        .get_user(None, Some(&user.username))
        .await
        .map_err(|e| SpotsError::DatabaseError(e.to_string()))?
        .ok_or_else(|| SpotsError::InvalidLogin)?;

    // Compare passwords
    let password_match = compare_password(&user.password, &existing_user.password_hash)?;

    // Log the user in if passwords match
    if password_match {
        let config = state.api_config.lock().await.clone();

        // Create auth token
        let token = Token::try_new(config, &existing_user.id.to_string());

        //
    }

    todo!()
}

/// Returns the currently authenticate user.
#[tauri::command]
async fn get_auth_user(state: State<'_, AppState>) -> ApiResult<FilterUserDto> {
    todo!()
}
