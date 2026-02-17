use crate::{
    database::users::UserExt,
    errors::{HttpError, HttpErrorMessage},
    handlers::dtos::{
        self as dtos, FilterUserDto, LoginUserDto, LoginUserResponseDto, RegisterUserDto,
    },
    utils::{
        jwt::create_jwt,
        password::{compare_password, hash_password},
    },
    AppState,
};
use axum::{
    extract::State,
    http::{header, HeaderMap, StatusCode},
    response::IntoResponse,
    routing::post,
    Extension, Json, Router,
};
use axum_extra::extract::cookie::Cookie;
use validator::Validate;

/// Handles all auth related API calls.
pub fn handler() -> Router {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
}

/// Registers the given user in the database.
pub async fn register(
    Extension(app_state): Extension<AppState>,
    Json(body): Json<RegisterUserDto>,
) -> Result<impl IntoResponse, HttpError> {
    // Validate the request body
    body.validate()
        .map_err(|e| HttpError::bad_request(e.to_string()))?;

    // Hash the password
    let hashed_password = hash_password(&body.password).map_err(|e| HttpError::server_error(e))?;

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
                Err(HttpError::unique_constraint_violation(db_err.message()))
            } else {
                Err(HttpError::server_error(HttpErrorMessage::DatabaseError(
                    db_err.to_string(),
                )))
            }
        }
        Err(e) => Err(HttpError::server_error(HttpErrorMessage::DatabaseError(
            e.to_string(),
        ))),
    }
}

pub async fn login(
    Extension(app_state): Extension<AppState>,
    Json(body): Json<LoginUserDto>,
) -> Result<impl IntoResponse, HttpError> {
    // Validate the request body
    body.validate()
        .map_err(|e| HttpError::bad_request(e.to_string()))?;

    // Get user from DB
    let user = app_state
        .db
        .lock()
        .await
        .get_user(None, Some(&body.username))
        .await
        .map_err(|e| HttpError::server_error(HttpErrorMessage::DatabaseError(e.to_string())))?
        .ok_or_else(|| HttpError::unauthorized(HttpErrorMessage::InvalidLogin))?;

    // Compare passwords
    let passwords_match = compare_password(&body.password, &user.password_hash)
        .map_err(|e| HttpError::server_error(e))?;

    if passwords_match {
        // Get config
        let config = app_state.config.lock().await.clone();

        // Create JWT
        let jwt = create_jwt(
            &user.id.to_string(),
            config.jwt_secret.as_bytes(),
            config.jwt_maxage_secs,
        )
        .map_err(|e| HttpError::server_error(e.to_string()))?;

        // Create cookie
        let cookie_duration =
            tauri::webview::cookie::time::Duration::seconds(config.jwt_maxage_secs);
        let cookie = Cookie::build(("auth-token", jwt.clone()))
            .path("/")
            .max_age(cookie_duration)
            .http_only(true)
            .build();

        // Create response
        let mut headers = HeaderMap::new();
        headers.append(
            header::SET_COOKIE,
            cookie.to_string().parse().expect("Invalid cookie"),
        );
        let filter_user = FilterUserDto::new(&user);
        let mut response = axum::response::Json(LoginUserResponseDto {
            status: "success".into(),
            user: filter_user,
            token: jwt,
        })
        .into_response();
        response.headers_mut().extend(headers);

        Ok(response)
    } else {
        Err(HttpError::bad_request(
            HttpErrorMessage::InvalidLogin.to_string(),
        ))
    }
}
