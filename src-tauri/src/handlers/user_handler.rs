use axum::Router;

use crate::AppState;

/// Handles all user related API calls.
pub fn handler() -> Router<AppState> {
    // TODO: Add actual endpoint handlers!
    Router::new()
}
