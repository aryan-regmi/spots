use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};

/// Represents all the errors from server.
pub enum ServerError {
    // TODO: Update with actual errors!
    _SomeError,
}

impl ToString for ServerError {
    fn to_string(&self) -> String {
        match self {
            ServerError::_SomeError => "Some error".into(),
        }
    }
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
            message: message.into(),
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
