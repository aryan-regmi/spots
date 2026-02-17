use axum::Router;

use crate::handlers::{auth_handler, user_handler};

/// Creates the router for the HTTP server.
pub fn create_router() -> Router {
    let api_route = Router::new()
        .nest("/auth", auth_handler::handler())
        // TODO: Add middleware to check auth!
        .nest("/user", user_handler::handler());
    Router::new().nest("/api/v1", api_route)
}
