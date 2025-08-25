use aes_gcm::{aead::Aead, AeadCore, Aes256Gcm, Key, KeyInit, Nonce};
use bincode::{Decode, Encode};
use iroh::{Endpoint, SecretKey};
use rand::rngs::OsRng;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};

use crate::database::Database;

type Result<T> = anyhow::Result<T, String>;

pub struct Network {
    endpoint: Option<Endpoint>,
}

impl Network {
    pub fn new() -> Self {
        Self { endpoint: None }
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

    /// Initializes the endpoint.
    pub async fn init_endpoint(&mut self, app_handle: &AppHandle, username: String) -> Result<()> {
        // Get secret key from database
        let db = app_handle.state::<Database>();
        let secret_key = {
            let encrypted_key = db
                .get_secret_key(username)
                .await
                .map_err(|e| e.to_string())?;
            self.decrypt_secret_key(encrypted_key)?
        };

        // Create the endpoint
        let endpoint = Endpoint::builder().secret_key(secret_key.clone());
        todo!()
    }
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
