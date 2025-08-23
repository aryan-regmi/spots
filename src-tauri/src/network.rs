#![allow(unused)]

use aes_gcm::{
    aead::{Aead, KeyInit},
    AeadCore, Aes256Gcm, Key, Nonce,
};
use anyhow::Result;
use iroh::{protocol::Router, Endpoint, SecretKey};
use iroh_gossip::{net::Gossip, proto::TopicId};
use rand::rngs::OsRng;
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EncryptedValue {
    value: Vec<u8>,
    nonce: Vec<u8>,
    encryption_key: Vec<u8>,
}

/// Generates a secret key if one doesn't exist.
#[tauri::command]
pub async fn generate_secret_key() -> Result<EncryptedValue, String> {
    // Create new key
    let rng = OsRng;
    let iroh_secret_key = SecretKey::generate(rng);

    // Encrypt key
    let (encrypted, nonce, key) = {
        let key = Aes256Gcm::generate_key(rng);
        let nonce = Aes256Gcm::generate_nonce(rng); // 96-bits; unique per message
        let cipher = Aes256Gcm::new(&key);

        // Encrypt
        let bytes = &iroh_secret_key.to_bytes()[..];
        let encrypted = cipher.encrypt(&nonce, bytes).map_err(|e| e.to_string())?;
        (encrypted, nonce, key)
    };

    Ok(EncryptedValue {
        value: encrypted,
        nonce: nonce.to_vec(),
        encryption_key: key.to_vec(),
    })
}

/// Initalizes an endpoint and a router (uses Gossip protocol).
///
/// The [NodeId] of the endpoint will be returned as a string.
///
/// # Note
/// The should only be called after an [EncryptedKey] has been generated using
/// [generate_secret_key].
#[tauri::command]
pub async fn init_endpoint(encrypted_secret_key: EncryptedValue) -> Result<String, String> {
    // Decrypt secret key
    let secret_key = decrypt_secret_key(encrypted_secret_key)?;

    // Create the endpoint
    let endpoint = Endpoint::builder()
        .secret_key(secret_key.clone())
        .discovery_n0()
        .discovery_local_network()
        .bind()
        .await
        .map_err(|e| e.to_string())?;
    let endpoint_id = endpoint.node_id();

    // Create the router
    let gossip = Gossip::builder().spawn(endpoint.clone());
    let router = Router::builder(endpoint.clone())
        .accept(iroh_gossip::ALPN, gossip.clone())
        .spawn();

    // Create and subscribe to new topic
    let id = TopicId::from_bytes(rand::random());
    let peers = vec![]; // FIXME: Passed in, get from database!
    let topic = gossip
        .subscribe(id, peers)
        .await
        .map_err(|e| e.to_string())?;

    let (sender, receiver) = topic.split();

    // TODO: Use tauri::State to manage state (keep router running, etc)
    //  - https://v2.tauri.app/develop/state-management/

    // TODO: Run entire thing in a `tauri::async_runtime::spawn` to keep it from closing

    Ok(endpoint_id.to_string())
}

/// Decrypts the given encrypted [SecretKey].
fn decrypt_secret_key(encrypted_secret_key: EncryptedValue) -> Result<SecretKey, String> {
    let secret_key_bytes = decrypt_value(encrypted_secret_key)?;
    Ok(SecretKey::from_bytes(
        &secret_key_bytes
            .try_into()
            .map_err(|_| "Invalid secret key")?,
    ))
}

/// Decrypts the given [EncryptedValue] to a vector of bytes.
fn decrypt_value(encrypted_value: EncryptedValue) -> Result<Vec<u8>, String> {
    // Convert vecs to arrays
    let key_bytes: [u8; 32] = encrypted_value
        .encryption_key
        .try_into()
        .map_err(|_| "Key must be exactly 32 bytes")?;
    let nonce_bytes: [u8; 12] = encrypted_value
        .nonce
        .try_into()
        .map_err(|_| "Nonce must be exactly 12 bytes")?;

    // Retreive nonce and cipher
    let key = Key::<Aes256Gcm>::from_slice(&key_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);
    let cipher = Aes256Gcm::new(key);

    // Decrypt
    cipher
        .decrypt(nonce, encrypted_value.value.as_slice())
        .map_err(|e| e.to_string())
}
