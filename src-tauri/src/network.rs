use std::str::FromStr;

use aes_gcm::{aead::Aead, AeadCore, Aes256Gcm, Key, KeyInit, Nonce};
use bincode::{Decode, Encode};
use iroh::{protocol::Router, Endpoint, NodeId, SecretKey};
use iroh_gossip::{
    api::{GossipReceiver, GossipSender},
    net::Gossip,
    proto::TopicId,
};
use rand::rngs::OsRng;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

use crate::database::Database;

type Result<T> = anyhow::Result<T, String>;

pub struct Network {
    pub endpoint: Option<Endpoint>,
    pub gossip: Option<Gossip>,
    pub router: Option<Router>,
    pub topic: Option<TopicState>,
}

impl Network {
    pub fn new() -> Self {
        Self {
            endpoint: None,
            gossip: None,
            router: None,
            topic: None,
        }
    }

    /// Closes the endpoint and associated resources.
    pub async fn close(&mut self) -> Result<()> {
        if let Some(router) = &self.router {
            router.shutdown().await.map_err(|e| e.to_string())?;
        }
        if let Some(gossip) = &self.gossip {
            gossip.shutdown().await.map_err(|e| e.to_string())?;
        }
        if let Some(endpoint) = &self.endpoint {
            endpoint.close().await;
        }
        *self = Self::new();
        Ok(())
    }

    /// Generates an encrypted secret key and encrypts it.
    pub fn generate_secret_key(&self) -> Result<EncryptedValue> {
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

    /// Decrypts the given encrypted [SecretKey].
    pub fn decrypt_secret_key(&self, encrypted_secret_key: EncryptedValue) -> Result<SecretKey> {
        let bytes = encrypted_secret_key.decrypt_to_bytes()?;
        Ok(SecretKey::from_bytes(
            &bytes.try_into().map_err(|_| "Invalid secret key")?,
        ))
    }

    /// Initializes the endpoint and stores it in the database.
    pub async fn init_endpoint(&mut self, app_handle: &AppHandle, username: String) -> Result<()> {
        // Get secret key from database
        let db = app_handle.state::<Database>();
        let secret_key = {
            let encrypted_key = db
                .get_secret_key(username.clone())
                .await
                .map_err(|e| e.to_string())?;
            self.decrypt_secret_key(encrypted_key)?
        };

        // Create the endpoint
        let endpoint = Endpoint::builder()
            .secret_key(secret_key.clone())
            .discovery_n0()
            .discovery_local_network()
            .bind()
            .await
            .map_err(|e| e.to_string())?;

        // Store endpoint address in the database
        db.set_endpoint_node(username, endpoint.node_id().to_string())
            .await
            .map_err(|e| e.to_string())?;

        // Create the router
        let gossip = Gossip::builder().spawn(endpoint.clone());
        let router = Router::builder(endpoint.clone())
            .accept(iroh_gossip::ALPN, gossip.clone())
            .spawn();

        // Update `self`
        self.endpoint = Some(endpoint);
        self.gossip = Some(gossip);
        self.router = Some(router);

        Ok(())
    }

    /// Create and subscribe to new topic.
    pub async fn init_topic(&mut self, app_handle: &AppHandle, username: String) -> Result<()> {
        let db = app_handle.state::<Database>();

        // Create new topic
        let topic_id = TopicId::from_bytes(rand::random());
        let peers = vec![]; // No peers initially
        let topic = self
            .gossip
            .as_ref()
            .ok_or(String::from("Invalid `Gossip`"))?
            .subscribe(topic_id, peers.clone())
            .await
            .map_err(|e| e.to_string())?;
        let (sender, receiver) = topic.split();

        // Add topic data to the database
        db.set_topic_id(username.clone(), topic_id.to_string())
            .await
            .map_err(|e| e.to_string())?;
        db.set_peers(username.clone(), Peers { nodes: peers })
            .await
            .map_err(|e| e.to_string())?;

        // Update `self`
        self.topic = Some(TopicState {
            id: topic_id,
            sender,
            receiver,
        });

        Ok(())
    }

    /// Loads the stored topic.
    pub async fn load_topic(&mut self, app_handle: &AppHandle, username: String) -> Result<()> {
        let db = app_handle.state::<Database>();

        // Load topic from database
        let topic_id = {
            if let Some(id) = db
                .get_topic_id(username.clone())
                .await
                .map_err(|e| e.to_string())?
            {
                TopicId::from_str(&id).map_err(|e| e.to_string())?
            } else {
                Err(format!(
                    "No topic id found in database for user `{username}`"
                ))?
            }
        };

        // Load peers from database
        let peers = db
            .get_peers(username.clone())
            .await
            .map_err(|e| e.to_string())?
            .nodes;

        // Create topic with db info
        let topic = self
            .gossip
            .as_ref()
            .ok_or(String::from("Invalid `Gossip`"))?
            .subscribe_and_join(topic_id, peers)
            .await
            .map_err(|e| e.to_string())?;
        let (sender, receiver) = topic.split();

        // Update `self`
        self.topic = Some(TopicState {
            id: topic_id,
            sender,
            receiver,
        });
        Ok(())
    }
}

#[derive(Serialize, Deserialize)]
pub struct Peers {
    pub nodes: Vec<NodeId>,
}

#[derive(Encode, Decode)]
pub struct PeersBincode {
    #[bincode(with_serde)]
    pub peers: Peers,
}

#[allow(unused)]
pub struct TopicState {
    pub id: TopicId,
    pub sender: GossipSender,
    pub receiver: GossipReceiver,
}

#[derive(Serialize, Deserialize, Encode, Decode)]
pub struct EncryptedValue {
    value: Vec<u8>,
    nonce: Vec<u8>,
    encryption_key: Vec<u8>,
}

#[derive(Encode, Decode)]
pub struct EncryptedValueBincode {
    #[bincode(with_serde)]
    pub value: EncryptedValue,
}

impl EncryptedValue {
    /// Decrypts the given [EncryptedValue] to a vector of bytes.
    pub fn decrypt_to_bytes(self) -> anyhow::Result<Vec<u8>, String> {
        // Convert vecs to arrays
        let key_bytes: [u8; 32] = self
            .encryption_key
            .try_into()
            .map_err(|_| "Key must be exactly 32 bytes")?;
        let nonce_bytes: [u8; 12] = self
            .nonce
            .try_into()
            .map_err(|_| "Nonce must be exactly 12 bytes")?;

        // Retreive nonce and cipher
        let key = Key::<Aes256Gcm>::from_slice(&key_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);
        let cipher = Aes256Gcm::new(key);

        // Decrypt
        cipher
            .decrypt(nonce, self.value.as_slice())
            .map_err(|e| e.to_string())
    }
}
