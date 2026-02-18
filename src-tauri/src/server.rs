use std::{net::SocketAddr, path::PathBuf, str::FromStr};

use axum::{http::HeaderValue, Extension, Router};
use axum_server::tls_rustls::RustlsConfig;
use tower_http::cors::CorsLayer;
use tracing::{error, info, span, Level};

use crate::{
    handlers::{auth_handler, user_handler},
    middleware, AppState,
};

/// Axum server configurations.
#[derive(Debug, Clone)]
pub struct ServerConfig {
    pub port: u64,
    pub jwt_secret: String,
    pub jwt_maxage_secs: i64,
}
impl ServerConfig {
    pub fn new() -> Self {
        let port = std::env::var("PORT")
            .expect("PORT must be set")
            .parse()
            .expect("Invalid value for PORT");
        let jwt_secret = std::env::var("JWT_SECRET_KEY").expect("JWT_SECRET_KEY must be set");
        let jwt_maxage_secs = std::env::var("JWT_MAXAGE_SECS")
            .expect("JWT_MAXAGE_SECS must be set")
            .parse()
            .expect("Invalid value for JWT_MAXAGE_SECS");

        Self {
            port,
            jwt_secret,
            jwt_maxage_secs,
        }
    }
}

#[derive(Debug)]
pub struct Server;

impl Server {
    pub async fn start(app_state: AppState) {
        let span = span!(Level::INFO, "SERVER");
        let _guard = span.enter();

        info!("Starting HTTP server");
        let config = app_state.config.lock().await.clone();

        // Configure TLS
        info!("Configuring TLS");
        let config_http = RustlsConfig::from_pem_file(
            PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("ssl-keys")
                .join("server-cert.pem"),
            PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("ssl-keys")
                .join("server-private-key.pem"),
        )
        .await
        .inspect_err(|e| error!("Failed to configure TLS: {e}"))
        .unwrap();
        info!("TLS configured");

        // Configure CORS
        info!("Configuring CORS");
        let cors = CorsLayer::new()
            .allow_origin(
                format!("http://localhost:{}", config.port)
                    .parse::<HeaderValue>()
                    .unwrap(),
            )
            .allow_headers([
                axum::http::header::AUTHORIZATION,
                axum::http::header::ACCEPT,
                axum::http::header::CONTENT_TYPE,
            ])
            .allow_credentials(true)
            .allow_methods([
                axum::http::Method::GET,
                axum::http::Method::POST,
                axum::http::Method::PUT,
            ]);
        info!("CORS configured");

        // Start server
        let server_app = Self::create_router()
            .await
            .layer(cors)
            .layer(Extension(app_state));
        let addr = SocketAddr::from_str(&format!("127.0.0.1:{}", config.port))
            .expect("Invalid socket address");
        let mut server = axum_server::bind_rustls(addr, config_http);
        server.http_builder().http2().enable_connect_protocol();
        server
            .serve(server_app.into_make_service())
            .await
            .map(|_| info!("Server started"))
            .expect("Unable to serve app");
    }

    /// Creates the router for the HTTP server.
    async fn create_router() -> Router {
        let api_route = Router::new()
            .nest("/auth", auth_handler::handler())
            .nest(
                "/user",
                user_handler::handler()
                    .layer(axum::middleware::from_fn(middleware::auth::authorize)),
            )
            .nest(
                "/playlist",
                Router::new().layer(axum::middleware::from_fn(middleware::auth::authorize)),
            )
            .nest(
                "/track",
                Router::new().layer(axum::middleware::from_fn(middleware::auth::authorize)),
            );
        Router::new().nest("/api/v1", api_route)
    }
}
