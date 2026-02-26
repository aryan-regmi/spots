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
        .map_err(|e| SpotsError::ValidationError(e))?;

    // Hash the password
    let hashed_password = hash_password(user.password)?;

    // Create new user in DB
    let db = state.db.lock().await;
    let create_user_result = db.create_user(user.username, hashed_password).await;

    create_user_result
        .map(|_| ApiResponse {
            status: ApiResponseStatus::Success,
            value: (),
        })
        .map_err(|e| {
            let db_path = db.path.clone();
            SpotsError::DatabaseError {
                database: db_path,
                error: e.to_string(),
            }
        })
}

/// Logs in the specified user.
#[tauri::command]
pub async fn login_user(
    state: State<'_, AppState>,
    user: LoginUserDto,
) -> ApiResult<LoginUserResponseDto> {
    // Validate user
    user.validate()?;

    // Get user from DB
    let db = state.db.lock().await;
    let existing_user = db
        .get_user(None, Some(&user.username))
        .await
        .map_err(|e| SpotsError::DatabaseError {
            database: db.path.clone(),
            error: e.to_string(),
        })?
        .ok_or_else(|| SpotsError::InvalidLoginCredentials)?;

    // Compare passwords
    let password_match = compare_password(&user.password, &existing_user.password_hash)?;

    // Log the user in if passwords match
    if password_match {
        let config = state.api_config.lock().await.clone();

        // Create auth token
        let token = Token::try_new(config, &existing_user.id.to_string())?;

        // Create Response
        Ok(ApiResponse::success(LoginUserResponseDto {
            user: FilterUserDto::from(existing_user),
            token,
        }))
    } else {
        Err(SpotsError::InvalidLoginCredentials)
    }
}
