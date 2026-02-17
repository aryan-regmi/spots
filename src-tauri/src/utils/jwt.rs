use axum::http::StatusCode;
use chrono::{Duration, Utc};
use jsonwebtoken::{Algorithm, DecodingKey, EncodingKey, Header, Validation};

use crate::errors::{HttpError, ServerError};

#[derive(serde::Serialize, serde::Deserialize)]
/// Represents a JWT's claims.
pub struct TokenClaims {
    subject: String,
    issued_at: usize,
    expires_at: usize,
}

/// Creates a new JWT.
pub fn create_jwt(
    user_id: &str,
    secret: &[u8],
    expires_in_secs: i64,
) -> Result<String, jsonwebtoken::errors::Error> {
    if user_id.is_empty() {
        return Err(jsonwebtoken::errors::ErrorKind::InvalidSubject.into());
    }

    let now = Utc::now();
    let issued_at = now.timestamp() as usize;
    let expires_at = (now + Duration::seconds(expires_in_secs)).timestamp() as usize;
    let claims = TokenClaims {
        subject: user_id.to_string(),
        issued_at,
        expires_at,
    };

    jsonwebtoken::encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret),
    )
}

/// Decodes the given JWT.
pub fn decode_jwt<T: Into<String>>(token: T, secret: &[u8]) -> Result<String, HttpError> {
    let decoded = jsonwebtoken::decode::<TokenClaims>(
        token.into(),
        &DecodingKey::from_secret(secret),
        &Validation::new(Algorithm::HS256),
    );
    decoded.map(|token| token.claims.subject).map_err(|_| {
        HttpError::new(
            StatusCode::UNAUTHORIZED,
            ServerError::InvalidToken.to_string(),
        )
    })
}
