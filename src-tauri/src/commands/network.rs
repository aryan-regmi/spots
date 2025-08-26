use std::sync::Arc;

use tauri::{AppHandle, Manager, State};
use tokio::sync::Mutex;

use crate::{database::Database, network::Network};

type Result<T> = anyhow::Result<T, String>;
type DatabaseState<'a> = State<'a, Database>;
type NetworkState<'a> = State<'a, Arc<Mutex<Network>>>;

/// Creates a new endpoint for the user.
///
/// # Note
/// This should be called only during the inital sign-up for a new user.
#[tauri::command]
pub async fn create_new_endpoint(
    app_handle: AppHandle,
    db: DatabaseState<'_>,
    net: NetworkState<'_>,
    username: String,
) -> Result<()> {
    let mut net = net.lock().await;

    // Create new secret key and store in db
    let encrypted_secret_key = net.generate_secret_key()?;
    db.set_secret_key(username.clone(), encrypted_secret_key)
        .await
        .map_err(|e| e.to_string())?;

    // Init endpoint
    net.init_endpoint(&app_handle, username.clone()).await?;
    drop(net);

    // Join topic in separate thread
    tauri::async_runtime::spawn(async move {
        let net: NetworkState = app_handle.state();
        let mut net = net.lock().await;
        net.init_topic(&app_handle, username.clone()).await.unwrap();
    });

    Ok(())
}

/// Loads the stored endpoint for the user.
///
/// # Note
/// This should be called only if the user already exists.
#[tauri::command]
pub async fn load_endpoint(
    app_handle: AppHandle,
    net: NetworkState<'_>,
    username: String,
) -> Result<()> {
    let mut net = net.lock().await;
    net.init_endpoint(&app_handle, username.clone()).await?;
    drop(net);

    // Join topic in separate thread
    tauri::async_runtime::spawn(async move {
        let net: NetworkState = app_handle.state::<Arc<Mutex<Network>>>();
        let mut net = net.lock().await;
        net.load_topic(&app_handle, username.clone()).await.unwrap();
    });

    Ok(())
}

/// Gets the endpoint address for the specfied user.
#[tauri::command]
pub async fn get_endpoint_addr(db: DatabaseState<'_>, username: String) -> Result<String> {
    db.get_endpoint_node(username)
        .await
        .map_err(|e| e.to_string())
}
