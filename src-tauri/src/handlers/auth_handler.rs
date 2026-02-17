use crate::{
    database::users::UserExt,
    errors::{HttpError, ServerError},
    handlers::dtos::{self as dtos, LoginUserDto, RegisterUserDto},
    AppState,
};
use axum::{extract::State, http::StatusCode, response::IntoResponse, routing::post, Json, Router};
use validator::Validate;

/// Handles all auth related API calls.
pub fn handler() -> Router<AppState> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
}

/// Registers the given user in the database.
pub async fn register(
    State(app_state): State<AppState>,
    Json(body): Json<RegisterUserDto>,
) -> Result<impl IntoResponse, HttpError> {
    // Validate the request body
    body.validate()
        .map_err(|e| HttpError::bad_request(e.to_string()));

    // Hash the password
    let hashed_password = password::hash(&body.password).map_err(|e| HttpError::server_error(e))?;

    // Create new user in DB
    let create_user_result = app_state
        .db
        .lock()
        .await
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

pub async fn login(
    State(app_state): State<AppState>,
    Json(body): Json<LoginUserDto>,
) -> Result<impl IntoResponse, HttpError> {
    // Validate the request body
    body.validate()
        .map_err(|e| HttpError::bad_request(e.to_string()));

    // Hash the password
    let hashed_password = password::hash(&body.password).map_err(|e| HttpError::server_error(e))?;

    // Get user from DB
    let user = app_state
        .db
        .lock()
        .await
        .get_user(None, Some(&body.username))
        .await
        .map_err(|e| HttpError::server_error(ServerError::DatabaseError(e.to_string())))?
        .ok_or_else(|| HttpError::server_error(ServerError::InvalidLogin))?;

    // Compare passwords
    let passwords_match = password::compare(&body.password, &user.password_hash)
        .map_err(|e| HttpError::server_error(e))?;

    if passwords_match {
        // Create JWT
        let jwt = jwt::create_jwt()
            .map_err(|e| HttpError::server_error(ServerError::OtherError(e.to_string())))?;

        // Create cookie

        // Create response

        Ok(dtos::Response {
            status: "failure",
            message: "TODO".into(),
        })
    } else {
        Err(HttpError::bad_request(
            ServerError::InvalidLogin.to_string(),
        ))
    }
}

mod password {
    use argon2::{
        password_hash::{rand_core::OsRng, SaltString},
        Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
    };

    use crate::errors::ServerError;

    /// Max password length.
    const MAX_PASSWORD_LENGTH: usize = 128;

    /// Hashes the given password.
    pub(super) fn hash(password: impl Into<String>) -> Result<String, ServerError> {
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
    pub(super) fn compare(password: &str, hashed_password: &str) -> Result<bool, ServerError> {
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
}

mod jwt {
    pub(super) fn create_jwt() -> Result<String, jsonwebtoken::errors::Error> {
        todo!()
    }
}
