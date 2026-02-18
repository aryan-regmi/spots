use std::fmt::Display;

use serde::Serialize;

/// Represents all backend errors.
#[derive(Debug, Clone, Serialize)]
pub enum SpotsError {
    EmptyUserId,
    EmptyPassword,
    MaxPasswordLengthExceeded(usize),
    HashingError(String),
    InvalidHashedPassword,
    DatabaseError(String),
    ValidationError(String),
    InvalidLogin,
    TokenCreationFailed(String),
    TokenDecryptionFailed(String),
}

impl Display for SpotsError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SpotsError::EmptyUserId => f.write_str("The provided user ID was empty"),
            SpotsError::EmptyPassword => f.write_str("The provided password was empty"),
            SpotsError::MaxPasswordLengthExceeded(max) => f.write_fmt(format_args!(
                "The maximum password length was exceed ({})",
                max
            )),
            SpotsError::HashingError(err) => {
                f.write_fmt(format_args!("Password hashing failed: {}", err))
            }
            SpotsError::InvalidHashedPassword => {
                f.write_str("The provided password hash was an invalid format")
            }
            SpotsError::DatabaseError(err) => {
                f.write_fmt(format_args!("Database operation failed: {}", err))
            }
            SpotsError::ValidationError(err) => {
                f.write_fmt(format_args!("Validation failed: {}", err))
            }
            SpotsError::InvalidLogin => f.write_str("Invalid login credentials"),
            SpotsError::TokenCreationFailed(err) => {
                f.write_fmt(format_args!("Unable to create auth token: {}", err))
            }
            SpotsError::TokenDecryptionFailed(err) => {
                f.write_fmt(format_args!("Unable to decrypt the auth token: {}", err))
            }
        }
    }
}
