use chrono::NaiveDateTime;
use validator::Validate;

use crate::database::models::User;

/// An API response.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Response {
    pub status: &'static str,
    pub message: String,
}

/// DTO passed to the `register` endpoint.
#[derive(Debug, Clone, Validate, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterUserDto {
    #[validate(length(min = 3, message = "Username must be atleast 3 characters long"))]
    #[validate(custom = "validate_username")]
    pub username: String,

    #[validate(
        length(min = 1, message = "Password is required"),
        length(min = 8, message = "Password must be at least 8 characters")
    )]
    pub password: String,

    #[validate(
        length(min = 1, message = "Confirm Password is required"),
        must_match(other = "password", message = "Passwords do not match")
    )]
    pub password_confirm: String,
}

/// DTO passed to the `/login` endpoint.
#[derive(Debug, Clone, Validate, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginUserDto {
    #[validate(length(min = 3, message = "Username must be at least 3 characters"))]
    pub username: String,

    #[validate(
        length(min = 1, message = "Password is required"),
        length(min = 8, message = "Password must be at least 8 characters")
    )]
    pub password: String,
}

/// DTO returned from the `/login` endpoint.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginUserResponseDto {
    pub status: String,
    pub user: FilterUserDto,
    pub token: String,
}

/// DTO for filtered user info.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FilterUserDto {
    pub id: String,
    pub username: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

impl FilterUserDto {
    pub fn new(user: &User) -> Self {
        Self {
            id: user.id.to_string(),
            username: user.username.clone(),
            created_at: user.created_at.expect("Invalid `created_at` field"),
            updated_at: user.updated_at.expect("Invalid `updated_at` field"),
        }
    }
}

/// Validates the username.
fn validate_username(username: &str) -> Result<(), validator::ValidationError> {
    let re = regex::Regex::new(r"^[a-zA-Z0-9_]+$").unwrap();
    if !re.is_match(username) {
        return Err(validator::ValidationError::new(
            "Username can only contain letters, numbers, and underscores",
        ));
    }

    Ok(())
}
