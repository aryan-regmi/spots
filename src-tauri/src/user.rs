use serde::{Deserialize, Serialize};

/// Represents a user.
#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: i64,
    pub username: String,
}
