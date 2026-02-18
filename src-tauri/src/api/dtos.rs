use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::{api::utils::token::Token, database::models::User};

/// The DTO used to register a user.
#[derive(Debug, Clone, Validate, Deserialize)]
pub struct RegisterUserDto {
    #[validate(
        length(min = 3, message = "The username must be at least 3 characters"),
        length(max = 20, message = "The username must be less than 20 characters"),
        custom(function = "validate_username")
    )]
    pub username: String,

    #[validate(
        length(min = 1, message = "Password is required"),
        length(min = 8, message = "Password must be at least 8 characters"),
        length(max = 64, message = "Password must be less than 64 characters")
    )]
    pub password: String,

    #[validate(
        length(min = 1, message = "Confirm Password is required"),
        must_match(other = "password", message = "Passwords do not match")
    )]
    pub password_confirm: String,
}

/// The DTO used to login a user.
#[derive(Debug, Clone, Validate, Deserialize)]
pub struct LoginUserDto {
    #[validate(
        length(min = 3, message = "The username must be at least 3 characters"),
        length(max = 20, message = "The username must be less than 20 characters"),
        custom(function = "validate_username")
    )]
    pub username: String,

    #[validate(
        length(min = 1, message = "Password is required"),
        length(min = 8, message = "Password must be at least 8 characters"),
        length(max = 64, message = "Password must be less than 64 characters")
    )]
    pub password: String,
}

/// The DTO returned after loggin in a user.
#[derive(Debug, Clone, Serialize)]
pub struct LoginUserResponseDto {
    pub user: FilterUserDto,
    pub token: String,
}

/// DTO for filtered user info.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FilterUserDto {
    pub id: String,
    pub username: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

impl From<User> for FilterUserDto {
    fn from(value: User) -> Self {
        Self {
            id: value.id.to_string(),
            username: value.username,
            created_at: value.created_at.expect("Invalid `created_at`"),
            updated_at: value.updated_at.expect("Invalid `updated_at`"),
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
