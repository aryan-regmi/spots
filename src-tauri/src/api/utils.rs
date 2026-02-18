use crate::errors::SpotsError;

/// The status of an API response.
#[derive(Debug, Clone, serde::Serialize)]
pub enum ApiResponseStatus {
    Success,
    Failure,
    Started,
    Pending,
    Completed,
}

/// An API response.
#[derive(Debug, Clone, serde::Serialize)]
pub struct ApiResponse<T> {
    pub status: ApiResponseStatus,
    pub value: T,
}

impl<T> ApiResponse<T>
where
    T: serde::Serialize,
{
    /// Represents a successful API response.
    pub fn success(value: T) -> Self {
        Self {
            status: ApiResponseStatus::Success,
            value,
        }
    }

    /// Represents a failure API response.
    pub fn failure(value: T) -> Self {
        Self {
            status: ApiResponseStatus::Failure,
            value,
        }
    }
}

/// The result type returned by API functions.
pub type ApiResult<T> = Result<ApiResponse<T>, SpotsError>;

/// API configurations.
#[derive(Debug, Clone)]
pub struct ApiConfig {
    pub token_secret_key: String,
    pub token_maxage_mins: i64,
}

impl ApiConfig {
    pub fn new() -> Self {
        let token_secret_key =
            std::env::var("TOKEN_SECRET_KEY").expect("TOKEN_SECRET_KEY must be set");
        let token_maxage_mins = std::env::var("TOKEN_MAXAGE_MINS")
            .expect("TOKEN_MAXAGE_MINS must be set")
            .parse()
            .expect("Invalid value for TOKEN_MAXAGE_MINS");

        Self {
            token_secret_key,
            token_maxage_mins,
        }
    }
}

pub mod password {
    use argon2::{
        password_hash::{rand_core::OsRng, SaltString},
        Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
    };

    use crate::errors::SpotsError;

    /// Max password length.
    const MAX_PASSWORD_LENGTH: usize = 64;

    /// Hashes the given password.
    pub fn hash_password(password: impl Into<String>) -> Result<String, SpotsError> {
        let password = password.into();

        if password.is_empty() {
            return Err(SpotsError::EmptyPassword);
        }

        if password.len() > MAX_PASSWORD_LENGTH {
            return Err(SpotsError::MaxPasswordLengthExceeded(MAX_PASSWORD_LENGTH));
        }

        let salt = SaltString::generate(&mut OsRng);
        let hashed_password = Argon2::default()
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| SpotsError::HashingError(e.to_string()))?
            .to_string();

        Ok(hashed_password)
    }

    /// Compares the two passwords.
    pub fn compare_password(password: &str, hashed_password: &str) -> Result<bool, SpotsError> {
        if password.is_empty() {
            return Err(SpotsError::EmptyPassword);
        }

        if password.len() > MAX_PASSWORD_LENGTH {
            return Err(SpotsError::MaxPasswordLengthExceeded(MAX_PASSWORD_LENGTH));
        }

        let parsed_hash =
            PasswordHash::new(hashed_password).map_err(|_| SpotsError::InvalidHashedPassword)?;

        let password_matches = Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .map_or(false, |_| true);

        Ok(password_matches)
    }
}

pub mod token {
    use chrono::NaiveDateTime;
    use serde::Serialize;

    #[derive(Debug, Clone, Serialize)]
    pub struct Token {
        value: String,
        issued_at: NaiveDateTime,
        expires_at: NaiveDateTime,
    }

    impl Token {
        pub fn new(user_id: &str) {}
    }
}
