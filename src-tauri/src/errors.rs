use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};

// TODO: Update with actual errors!
//
/// Represents all the errors from server.
pub enum ServerError {
    EmptyPassword,
    MaxPasswordLengthExceeded(usize),
    HashingError,
    InvalidHashFormat,
    DatabaseError(String),
    OtherError(String),
}

impl ToString for ServerError {
    fn to_string(&self) -> String {
        match self {
            ServerError::EmptyPassword => "The password field cannot be empty".into(),
            ServerError::MaxPasswordLengthExceeded(max_len) => {
                format!("The password length must not exceed {max_len} charcters")
            }
            ServerError::HashingError => "An error occured while hashing the password".into(),
            ServerError::InvalidHashFormat => "The hashed password was an invalid format".into(),
            ServerError::DatabaseError(e) => format!("An error occured in the database: {e}"),
        }
    }
}

/// Represents an error response.
#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct ErrorResponse {
    pub status: String,
    pub message: String,
}

/// Represents an HTTP error sent by an endpoint.
#[derive(Debug)]
pub struct HttpError {
    pub status: StatusCode,
    pub message: String,
}

impl HttpError {
    /// Creates a new [HttpError].
    pub fn new(status_code: StatusCode, message: impl Into<String>) -> Self {
        Self {
            status: status_code,
            message: message.into(),
        }
    }

    /// An [HttpError] representing a server error.
    pub fn server_error(message: ServerError) -> Self {
        HttpError {
            message: message.to_string(),
            status: StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    /// An [HttpError] representing  a bad request.
    pub fn bad_request(message: impl Into<String>) -> Self {
        HttpError {
            message: message.into(),
            status: StatusCode::BAD_REQUEST,
        }
    }

    /// An [HttpError] representing a unique constraint violation in the database.
    pub fn unique_constraint_violation(message: impl Into<String>) -> Self {
        HttpError {
            message: message.into(),
            status: StatusCode::CONFLICT,
        }
    }

    /// An [HttpError] representing a unauthorized access attempt.
    pub fn unauthorized(message: impl Into<String>) -> Self {
        HttpError {
            message: message.into(),
            status: StatusCode::UNAUTHORIZED,
        }
    }

    /// Converts the [HttpError] into a server response.
    pub fn into_http_response(self) -> Response {
        let json_response = Json(ErrorResponse {
            status: "fail".to_string(),
            message: self.message.clone(),
        });

        (self.status, json_response).into_response()
    }
}

impl ToString for HttpError {
    fn to_string(&self) -> String {
        format!(
            "HttpError: status: {}, message: {}",
            self.status, self.message
        )
    }
}

impl IntoResponse for HttpError {
    fn into_response(self) -> Response {
        self.into_http_response()
    }
}
