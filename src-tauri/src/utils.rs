use std::sync::Arc;

use tauri::State;
use tokio::sync::Mutex;

use crate::{database::Database, network::Network};

pub type Result<T> = anyhow::Result<T>;

pub type StringErrResult<T> = anyhow::Result<T, String>;

pub type DatabaseState<'a> = State<'a, Database>;

pub type NetworkState<'a> = State<'a, Arc<Mutex<Network>>>;
