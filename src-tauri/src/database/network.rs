use crate::{
    database::Database,
    network::{EncryptedValue, EncryptedValueBincode, Peers, PeersBincode},
    Result,
};
use sqlx::Row;

impl Database {
    /// Gets the secret key for the specified user.
    pub async fn get_secret_key(&self, user_id: i64) -> Result<EncryptedValue> {
        let result = sqlx::query("SELECT secret_key FROM network WHERE user_id = ?")
            .bind(user_id)
            .fetch_one(&self.pool)
            .await?;
        let bytes: Vec<u8> = result.get("secret_key");
        let (encrypted_key, _): (EncryptedValueBincode, usize) =
            bincode::decode_from_slice(&bytes, bincode::config::standard())?;
        Ok(encrypted_key.value)
    }

    /// Sets the endpoint node address for the specified user.
    pub async fn set_endpoint_node(&self, user_id: i64, endpoint_address: String) -> Result<()> {
        sqlx::query("UPDATE network SET endpoint = ? WHERE user_id = ?")
            .bind(endpoint_address)
            .bind(user_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    /// Sets the topic id for the specified user.
    pub async fn set_topic_id(&self, user_id: i64, topic_id: String) -> Result<()> {
        sqlx::query("UPDATE network SET topic_id = ? WHERE user_id = ?")
            .bind(topic_id)
            .bind(user_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    /// Sets the peers for the specified username.
    pub async fn set_peers(&self, user_id: i64, peers: Peers) -> Result<()> {
        let peers_bytes =
            bincode::encode_to_vec(PeersBincode { peers }, bincode::config::standard())?;
        sqlx::query("UPDATE network SET peers = ? WHERE user_id = ?")
            .bind(peers_bytes)
            .bind(user_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    /// Gets the topic ID for the specified user.
    pub async fn get_topic_id(&self, user_id: i64) -> Result<Option<String>> {
        let result = sqlx::query("SELECT topic_id FROM network WHERE user_id = ?")
            .bind(user_id)
            .fetch_one(&self.pool)
            .await?;
        Ok(result.get("topic_id"))
    }

    /// Gets the peers for the specified username.
    pub async fn get_peers(&self, user_id: i64) -> Result<Peers> {
        let result = sqlx::query("SELECT peers FROM network where user_id = ?")
            .bind(user_id)
            .fetch_one(&self.pool)
            .await?;
        let bytes: Option<Vec<u8>> = result.get("peers");
        if let Some(bytes) = bytes {
            let (peers, _): (PeersBincode, usize) =
                bincode::decode_from_slice(&bytes, bincode::config::standard())?;
            Ok(peers.peers)
        } else {
            Ok(Peers { nodes: vec![] })
        }
    }

    /// Sets the secret key for the specified user.
    pub async fn set_secret_key(&self, user_id: i64, secret_key: EncryptedValue) -> Result<()> {
        let secret_key_bytes = bincode::encode_to_vec(
            EncryptedValueBincode { value: secret_key },
            bincode::config::standard(),
        )?;
        sqlx::query("INSERT INTO network (user_id, secret_key) VALUES (?,?)")
            .bind(user_id)
            .bind(secret_key_bytes)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    /// Gets the endpoint node address for the specified user.
    pub async fn get_endpoint_node(&self, user_id: i64) -> Result<Option<String>> {
        let result = sqlx::query("SELECT endpoint FROM network WHERE user_id = ?")
            .bind(user_id)
            .fetch_one(&self.pool)
            .await?;
        Ok(result.get("endpoint"))
    }
}
