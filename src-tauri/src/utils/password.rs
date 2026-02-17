use argon2::{
    password_hash::{rand_core::OsRng, SaltString},
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
};

use crate::errors::ServerError;

/// Max password length.
const MAX_PASSWORD_LENGTH: usize = 128;

/// Hashes the given password.
pub fn hash_password(password: impl Into<String>) -> Result<String, ServerError> {
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
pub fn compare_password(password: &str, hashed_password: &str) -> Result<bool, ServerError> {
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
