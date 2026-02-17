use crate::{
    database::users::UserExt,
    errors::{HttpError, ServerError},
    handlers::dtos::{self as dtos, RegisterUserDto},
    AppState,
};
use argon2::{
    password_hash::{rand_core::OsRng, SaltString},
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
};
use axum::{http::StatusCode, response::IntoResponse, routing::post, Extension, Json, Router};
use std::sync::Arc;
use validator::Validate;

/// Handles all auth related API calls.
pub fn handler() -> Router {
    // TODO: Add actual endpoint handlers!
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
}

/// Registers the given user in the database.
pub async fn register(
    Extension(app_state): Extension<Arc<AppState>>,
    Json(body): Json<RegisterUserDto>,
) -> Result<impl IntoResponse, HttpError> {
    // Validate the request body
    body.validate()
        .map_err(|e| HttpError::bad_request(e.to_string()));

    // Hash the password
    let hashed_password = hash_password(&body.password).map_err(|e| HttpError::server_error(e))?;

    // Create new user in DB
    let create_user_result = app_state
        .lock()
        .await
        .db
        .create_user(&body.username, hashed_password)
        .await;

    match create_user_result {
        Ok(_user) => Ok((
            StatusCode::CREATED,
            Json(dtos::Response {
                status: "success",
                message: "Registration successful".into(),
            }),
        )),
        Err(sqlx::Error::Database(db_err)) => {
            if db_err.is_unique_violation() {
                Err(HttpError::server_error(ServerError::OtherError(
                    "Unique constraint violation".into(),
                )))
            } else {
                Err(HttpError::server_error(ServerError::OtherError(
                    db_err.to_string(),
                )))
            }
        }
        Err(e) => Err(HttpError::server_error(ServerError::OtherError(
            e.to_string(),
        ))),
    }
}

pub async fn login() {}

const MAX_PASSWORD_LENGTH: usize = 128;

/// Hashes the given password.
fn hash_password(password: impl Into<String>) -> Result<String, ServerError> {
    let password = password.into();

    if password.is_empty() {
        return Err(ServerError::EmptyPassword);
    }

    if password.len() > MAX_PASSWORD_LENGTH {
        return Err(ServerError::MaxPasswordLengthExceeded(MAX_PASSWORD_LENGTH));
    }

    let salt = SaltString::generate(&mut OsRng);
    let hashed_password = Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map_err(|_| ServerError::HashingError)?
        .to_string();

    Ok(hashed_password)
}

/// Compares the two passwords.
fn compare_passwords(password: &str, hashed_password: &str) -> Result<bool, ServerError> {
    if password.is_empty() {
        return Err(ServerError::EmptyPassword);
    }

    if password.len() > MAX_PASSWORD_LENGTH {
        return Err(ServerError::MaxPasswordLengthExceeded(MAX_PASSWORD_LENGTH));
    }

    let parsed_hash =
        PasswordHash::new(hashed_password).map_err(|_| ServerError::InvalidHashFormat)?;

    let password_matches = Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .map_or(false, |_| true);

    Ok(password_matches)
}
