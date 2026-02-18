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
    status: ApiResponseStatus,
    value: T,
}

impl ApiResponse<T>
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
