use axum::Router;

use crate::{
    handlers::{auth_handler, user_handler},
    AppState,
};

/// Creates the router for the HTTP server.
pub fn create_router() -> Router<AppState> {
    // FIXME: Add middleware to check auth!
    let api_route = Router::new()
        .nest("/auth", auth_handler::handler())
        .nest("/user", user_handler::handler());
    Router::new().nest("/api/v1", api_route)
}
