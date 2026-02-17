use validator::Validate;

/// An API response.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Response {
    pub status: &'static str,
    pub message: String,
}

/// DTO for registering a user.
#[derive(Debug, Clone, Validate, serde::Serialize, serde::Deserialize)]
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
    #[serde(rename = "passwordConfirm")]
    pub password_confirm: String,
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
