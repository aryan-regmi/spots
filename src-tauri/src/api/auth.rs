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
pub async fn register_user(state: State<'_, AppState>, user: RegisterUserDto) -> ApiResult<()> {
    // Validate user
    user.validate()
        .map_err(|e| SpotsError::ValidationError(e.to_string()).into())?;

    // Hash the password
    let hashed_password = hash_password(user.password).map_err(|e| e.into())?;

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
        .map_err(|e| SpotsError::DatabaseError(e.to_string()).into())
}

/// Logs in the specified user.
#[tauri::command]
pub async fn login_user(
    state: State<'_, AppState>,
    user: LoginUserDto,
) -> ApiResult<LoginUserResponseDto> {
    // Validate user
    user.validate()
        .map_err(|e| SpotsError::ValidationError(e.to_string()).into())?;

    // Get user from DB
    let existing_user = state
        .db
        .lock()
        .await
        .get_user(None, Some(&user.username))
        .await
        .map_err(|e| SpotsError::DatabaseError(e.to_string()).into())?
        .ok_or_else(|| SpotsError::InvalidLogin.into())?;

    // Compare passwords
    let password_match =
        compare_password(&user.password, &existing_user.password_hash).map_err(|e| e.into())?;

    // Log the user in if passwords match
    if password_match {
        let config = state.api_config.lock().await.clone();

        // Create auth token
        let token = Token::try_new(config, &existing_user.id.to_string()).map_err(|e| e.into())?;

        // Create Response
        Ok(ApiResponse::success(LoginUserResponseDto {
            user: FilterUserDto::from(existing_user),
            token,
        }))
    } else {
        Err(SpotsError::InvalidLogin.into())
    }
}
