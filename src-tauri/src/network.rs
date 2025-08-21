use anyhow::Result;
use iroh::{protocol::Router, Endpoint, SecretKey};
use iroh_gossip::net::Gossip;

// TODO: FINISH
#[tauri::command]
#[tokio::main]
pub async fn init_endpoint() -> Result<()> {
    // FIXME: Generate only once and save to db
    //
    // Generate a secret key
    let secret_key = SecretKey::generate(rand::rngs::OsRng);

    // Create the endpoint
    let endpoint = Endpoint::builder()
        .secret_key(secret_key)
        .discovery_n0()
        .discovery_local_network()
        .bind()
        .await?;

    // Build an instance of the gossip protocol
    let gossip = Gossip::builder().spawn(endpoint.clone());

    // Build the router to route incoming messages to their protocols
    let router = Router::builder(endpoint.clone())
        .accept(iroh_gossip::ALPN, gossip.clone())
        .spawn();

    Ok(())
}
