use serde::Deserialize;
use tauri::State;
use validator::Validate;

use crate::{
    api::{
        dtos::{FilterUserDto, LoginUserDto, LoginUserResponseDto, RegisterUserDto},
        utils::{ApiResponse, ApiResult},
    },
    errors::SpotsError,
    AppState,
};

pub trait AuthApi {
    /// Registers the specified user.
    pub async fn register_user(&self, user: RegisterUserDto) -> ApiResult<()>;

    /// Logs in the specified user.
    pub async fn login_user(&self, user: LoginUserDto) -> ApiResult<LoginUserResponseDto>;

    /// Returns the currently authenticate user.
    pub async fn get_auth_user() -> ApiResult<FilterUserDto>;
}
