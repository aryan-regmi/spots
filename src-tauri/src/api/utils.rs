use serde::Serialize;
use tauri::ipc::Channel;

use crate::errors::SpotsError;

// FIXME: Remove `ApiResponse` from all commands -> Return types directly
//  - Only use it for Channels!

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

    /// Represents a pending API response.
    pub fn pending(value: T) -> Self {
        Self {
            status: ApiResponseStatus::Pending,
            value,
        }
    }
}

/// The result type returned by API functions.
pub type ApiResult<T> = Result<ApiResponse<T>, SpotsError>;

/// The response from a channel.
pub type ResponseChannel<T> = Channel<ApiResponse<Option<T>>>;

/// Signals the start of the stream.
pub fn signal_stream_start<T>(channel: &ResponseChannel<T>)
where
    T: Serialize,
{
    channel
        .send(ApiResponse {
            status: ApiResponseStatus::Started,
            value: None,
        })
        .expect("Failed to send `start` signal to channel");
}

/// Signals the end of the stream.
pub fn signal_stream_end<T>(channel: &ResponseChannel<T>)
where
    T: Serialize,
{
    channel
        .send(ApiResponse {
            status: ApiResponseStatus::Completed,
            value: None,
        })
        .expect("Failed to send `start` signal to channel");
}

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
            .map_err(|e| SpotsError::PasswordHashError(e.to_string()))?
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

        let parsed_hash = PasswordHash::new(hashed_password)
            .map_err(|e| SpotsError::PasswordHashError(e.to_string()))?;

        let password_matches = Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .map_or(false, |_| true);

        Ok(password_matches)
    }
}

pub mod token {

    use std::{fmt::Display, str::FromStr};

    use base64::{prelude::BASE64_STANDARD, Engine};
    use chrono::{DateTime, Duration, Utc};
    use ring::aead::{Aad, BoundKey, Nonce, NonceSequence, UnboundKey, AES_256_GCM, NONCE_LEN};
    use serde::{Deserialize, Serialize};
    use tauri::State;
    use uuid::Uuid;

    use crate::{api::utils::ApiConfig, errors::SpotsError, AppState};

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Token {
        user_id: String,
        issued_at: usize,
        expires_at: usize,
    }

    impl Display for Token {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            f.write_fmt(format_args!(
                "Token {{ value: {}, issued_at: {}, expires_at: {} }}",
                self.user_id, self.issued_at, self.expires_at
            ))
        }
    }

    impl Token {
        /// Creates a new encrypted auth token for the user with the given ID.
        pub fn try_new(
            config: ApiConfig,
            user_id: impl Into<String>,
        ) -> Result<String, SpotsError> {
            let user_id = user_id.into();
            if user_id.is_empty() {
                return Err(SpotsError::EmptyUserId);
            }

            // Setup token metadata
            let now = Utc::now();
            let issued_at = now.timestamp() as usize;
            let expires_at =
                (now + Duration::minutes(config.token_maxage_mins)).timestamp() as usize;
            let token = Token {
                user_id,
                issued_at,
                expires_at,
            };

            Token::encrypt(config, token)
        }

        /// Extracts a token from the encrypted token string.
        pub fn from_encrypted(
            config: ApiConfig,
            encrypted_token: String,
        ) -> Result<Self, SpotsError> {
            let token_str = Token::decrypt(config, encrypted_token)?;
            let token: Token =
                serde_json::from_str(&token_str).map_err(|e| SpotsError::AuthTokenParseError {
                    token_str,
                    error: e.to_string(),
                })?;
            Ok(token)
        }

        /// Gets the user ID from the encrypted token.
        pub fn get_user_id(&self) -> Uuid {
            Uuid::from_str(&self.user_id).expect("Invalid user ID")
        }

        /// Makes sure the token is valid (not expired).
        pub fn is_valid(&self) -> bool {
            let now = Utc::now();
            let expires_at: DateTime<Utc> =
                match DateTime::from_timestamp(self.expires_at as i64, 0) {
                    Some(t) => t,
                    None => return false,
                };
            if now >= expires_at {
                false
            } else {
                true
            }
        }

        /// Encrypts the given token.
        fn encrypt(config: ApiConfig, token: Token) -> Result<String, SpotsError> {
            // Create key & cipher to encrypt the token
            let key = UnboundKey::new(&AES_256_GCM, &config.token_secret_key.as_bytes()[0..32])
                .map_err(|e| SpotsError::AuthTokenEncryptError {
                    token: token.clone(),
                    error: e.to_string(),
                })?;
            let mut cipher =
                ring::aead::SealingKey::new(key, NonceSequenceGenerator { counter: 0 });

            // Get token as a JSON string
            let token_str =
                serde_json::to_string(&token).map_err(|e| SpotsError::AuthTokenSerializeError {
                    token: token.clone(),
                    error: e.to_string(),
                })?;

            // Prepare buffer to store encrypted token by padding it to the required size for
            // the AES_256_GCM algorithim
            let mut encrypt_buffer = token_str.clone().into_bytes();
            let padding = AES_256_GCM.tag_len().checked_sub(token_str.len());
            if let Some(padding) = padding {
                (0..padding).for_each(|_| encrypt_buffer.push(0));
            }

            // Encrypt the token into `encrypt_buffer`
            cipher
                .seal_in_place_append_tag(Aad::empty(), &mut encrypt_buffer)
                .map_err(|e| SpotsError::AuthTokenEncryptError {
                    token,
                    error: e.to_string(),
                })?;

            // Base64 encode the encrypted token
            Ok(BASE64_STANDARD.encode(encrypt_buffer))
        }

        /// Decrypts the given (encrypted) token.
        fn decrypt(config: ApiConfig, token: String) -> Result<String, SpotsError> {
            // Setup keys/cipher
            let key = UnboundKey::new(&AES_256_GCM, &config.token_secret_key.as_bytes()[0..32])
                .map_err(|e| SpotsError::AuthTokenDecryptError {
                    token_str: token.clone(),
                    error: e.to_string(),
                })?;
            let mut cipher =
                ring::aead::OpeningKey::new(key, NonceSequenceGenerator { counter: 0 });

            // Decrypt
            let mut decoded =
                BASE64_STANDARD
                    .decode(&token)
                    .map_err(|e| SpotsError::AuthTokenDecodeError {
                        base64_encoded_token: token.clone(),
                        error: e.to_string(),
                    })?;
            let decrypted = cipher
                .open_in_place(Aad::empty(), &mut decoded)
                .map_err(|e| SpotsError::AuthTokenDecryptError {
                    token_str: token,
                    error: e.to_string(),
                })?;

            Ok(String::from_utf8_lossy(decrypted)
                .trim_matches(|c: char| c.is_control())
                .to_string())
        }
    }

    /// Generates a `NonceSequence`.
    struct NonceSequenceGenerator {
        counter: u64,
    }

    impl NonceSequence for NonceSequenceGenerator {
        fn advance(&mut self) -> Result<Nonce, ring::error::Unspecified> {
            let mut nonce_bytes = self.counter.to_ne_bytes().to_vec();
            nonce_bytes.extend_from_slice(&mut self.counter.to_ne_bytes());
            let mut nonce = [0u8; NONCE_LEN];
            for (idx, b) in nonce.iter_mut().enumerate() {
                *b = nonce_bytes[idx];
            }
            self.counter += 1;
            Ok(Nonce::assume_unique_for_key(nonce))
        }
    }

    /// Verifies the auth token.
    pub async fn verify_token(
        state: &State<'_, AppState>,
        auth_token: String,
    ) -> Result<Token, SpotsError> {
        let config = state.api_config.lock().await.clone();
        let token = Token::from_encrypted(config, auth_token)?;
        if !token.is_valid() {
            return Err(SpotsError::AuthTokenExpired);
        }
        Ok(token)
    }

    #[cfg(test)]
    mod tests {
        use dotenvy::dotenv;
        use serde_json::json;

        use crate::api::utils::token::Token;

        use super::*;

        #[test]
        fn test_encrypt_decrypt() -> Result<(), SpotsError> {
            dotenv().unwrap();
            let config = ApiConfig::new();
            let encrypted = Token::try_new(config.clone(), "Me")?;
            let decrypted = Token::decrypt(config, encrypted)?;
            let decrypted: serde_json::Value = serde_json::from_str(&decrypted).unwrap();
            assert_eq!(*decrypted.get("user_id").unwrap(), json!("Me"));

            Ok(())
        }
    }
}
