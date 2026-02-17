use axum::{extract::Request, http::header, middleware::Next, response::IntoResponse, Extension};
use axum_extra::extract::CookieJar;
use futures::TryFutureExt;
use uuid::Uuid;

use crate::{
    database::{models::User, users::UserExt},
    errors::{HttpError, HttpErrorMessage},
    utils::jwt::decode_jwt,
    AppState,
};

/// The value that gets injected by the auth middleware.
#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct JWTAuthMiddleware {
    pub user: User,
}

/// Middelware function for role-based authorization.
pub async fn authorize(
    Extension(app_state): Extension<AppState>,
    cookie_jar: CookieJar,
    mut req: Request,
    next: Next,
) -> Result<impl IntoResponse, HttpError> {
    // Extract access token from cookie or header
    let jwt = cookie_jar
        .get("auth-token")
        .map(|cookie| cookie.value().to_string())
        .or_else(|| {
            // Get token from header
            req.headers()
                .get(header::AUTHORIZATION)
                .and_then(|auth_header| auth_header.to_str().ok())
                .and_then(|auth_value| {
                    if auth_value.starts_with("Bearer ") {
                        Some(auth_value[7..].to_owned())
                    } else {
                        None
                    }
                })
        })
        .ok_or_else(|| HttpError::unauthorized(HttpErrorMessage::TokenNotProvided));

    // Decode the token
    let decoded_jwt = jwt
        .map(async |token| {
            decode_jwt(
                token,
                app_state.config.lock().await.jwt_secret.clone().as_bytes(),
            )
        })?
        .await?;

    // Get user from DB
    let db = app_state.db.lock().await;
    let user = Uuid::parse_str(&decoded_jwt)
        .map_err(|_| HttpError::unauthorized(HttpErrorMessage::InvalidToken))
        .map(|id| {
            db.get_user(Some(id), None).map_err(|e| {
                HttpError::unauthorized(HttpErrorMessage::DatabaseError(e.to_string()))
            })
        })?
        .await?
        .ok_or_else(|| HttpError::unauthorized(HttpErrorMessage::InvalidUser))?;

    // Insert the authenticated user into the request
    req.extensions_mut()
        .insert(JWTAuthMiddleware { user: user });

    Ok(next.run(req).await)
}
