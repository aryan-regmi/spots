use std::sync::Arc;

use tauri::State;
use tokio::sync::Mutex;

use crate::{database::Database, network::Network};

pub mod auth;
pub mod network;
pub mod users;

pub type DatabaseState<'a> = State<'a, Database>;
pub type NetworkState<'a> = State<'a, Arc<Mutex<Network>>>;
