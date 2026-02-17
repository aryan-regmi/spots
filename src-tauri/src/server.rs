use std::{net::SocketAddr, path::PathBuf, str::FromStr, sync::Arc};

use axum::{http::HeaderValue, Router};
use axum_server::tls_rustls::RustlsConfig;
use tower_http::cors::CorsLayer;

use crate::{
    handlers::{auth_handler, user_handler},
    AppState,
};

#[derive(Debug)]
pub struct Server;

impl Server {
    pub async fn start(app_state: AppState) {
        let config = app_state.config.lock().await.clone();

        // Configure TLS
        let config_http = RustlsConfig::from_pem_file(
            PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("ssl-keys")
                .join("server-cert.pem"),
            PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("ssl-keys")
                .join("server-private-key.pem"),
        )
        .await
        .unwrap();

        // Configure CORS
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

        // Start server
        let server_app = Self::create_router(app_state).await.layer(cors);
        let addr = SocketAddr::from_str(&format!("127.0.0.1:{}", config.port))
            .expect("Invalid socket address");
        let mut server = axum_server::bind_rustls(addr, config_http);
        server.http_builder().http2().enable_connect_protocol();
        server
            .serve(server_app.into_make_service())
            .await
            .expect("Unable to serve app");
    }

    /// Creates the router for the HTTP server.
    async fn create_router(state: AppState) -> Router {
        let api_route = Router::new()
            .nest("/auth", auth_handler::handler())
            .nest("/user", user_handler::handler());
        Router::new().with_state(state).nest("/api/v1", api_route)
    }
}
