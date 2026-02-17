use axum::Router;

use crate::handlers::user_handler;

/// Creates the router for the HTTP server.
pub fn create_router() -> Router {
    let api_route = Router::new().nest("/user", user_handler::handler());
    Router::new().nest("/api/v1", api_route)
}
