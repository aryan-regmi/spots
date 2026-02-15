pub mod auth;

/// Represents an API response.
#[derive(serde::Deserialize, serde::Serialize)]
pub(crate) struct Response<T> {
    /// Whether this represents a succesful response or an error response.
    success: bool,

    /// The actual response.
    value: T,
}

impl<T> Response<T> {
    /// Creates a successful response.
    pub(crate) fn success(value: T) -> Self {
        Self {
            success: true,
            value,
        }
    }
}

impl Response<ErrorResponse> {
    /// Creates an error response.
    pub(crate) fn error(kind: impl AsRef<str>, message: impl AsRef<str>) -> Self {
        Self {
            success: false,
            value: ErrorResponse {
                kind: kind.as_ref().into(),
                message: message.as_ref().into(),
            },
        }
    }
}

/// Represents an error response.
#[derive(serde::Deserialize, serde::Serialize)]
pub(crate) struct ErrorResponse {
    kind: String,
    message: String,
}

pub(crate) type ApiResult<T> = Result<Response<T>, Response<ErrorResponse>>;
