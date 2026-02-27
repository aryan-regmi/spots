use serde::Serialize;
use thiserror::Error;

use crate::api::utils::token::Token;

#[allow(dead_code)] // FIXME: Remove!
#[derive(Error, Debug, Serialize)]
pub enum SpotsError {
    #[error("The provided password was empty")]
    EmptyPassword,

    #[error("Exceeded the maximum password length ({0})")]
    MaxPasswordLengthExceeded(usize),

    #[error("Unable to hash the password: {0}")]
    PasswordHashError(String),

    #[error("The provided user ID was empty")]
    EmptyUserId,

    #[error("Unable to parse the auth token: {{ token: {}, error: {} }}", .token_str, .error)]
    AuthTokenParseError { token_str: String, error: String },

    #[error("Unable to encrypt the auth token: {{ token: {}, error: {} }}", .token, .error)]
    AuthTokenEncryptError { token: Token, error: String },

    #[error("Unable to serialize the auth token: {{ token: {}, error: {} }}", .token, .error)]
    AuthTokenSerializeError { token: Token, error: String },

    #[error("Unable to decrypt the auth token: {{ token_str: {}, error: {} }}", .token_str, .error)]
    AuthTokenDecryptError { token_str: String, error: String },

    #[error("Unable to decode base64 token: {{ token_base64: {}, error: {} }}", .base64_encoded_token, .error)]
    AuthTokenDecodeError {
        base64_encoded_token: String,
        error: String,
    },

    #[error("The auth token has expired and is invalid")]
    AuthTokenExpired,

    #[error("Validation failed: {0}")]
    ValidationError(#[from] validator::ValidationErrors),

    #[error("Database error: {{ database: {}, error: {} }}", .database, .error)]
    DatabaseError { database: String, error: String },

    #[error("Invalid login credentials provided")]
    InvalidLoginCredentials,
}
