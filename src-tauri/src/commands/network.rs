use std::sync::Arc;

use tauri::{AppHandle, Manager};
use tokio::sync::Mutex;

use crate::{
    commands::{DatabaseState, NetworkState},
    network::Network,
    StringResult,
};

/// Creates a new endpoint for the user.
///
/// # Note
/// This should be called only during the inital sign-up for a new user.
#[tauri::command]
pub async fn create_new_endpoint(
    app_handle: AppHandle,
    db: DatabaseState<'_>,
    net: NetworkState<'_>,
    user_id: i64,
) -> StringResult<()> {
    // Create new secret key and store in db
    let mut net = net.lock().await;
    let encrypted_secret_key = net.generate_secret_key().map_err(|e| e.to_string())?;
    db.set_secret_key(user_id, encrypted_secret_key)
        .await
        .map_err(|e| e.to_string())?;

    // Create endpoint and topic
    net.init_endpoint(&app_handle, user_id)
        .await
        .map_err(|e| e.to_string())?;
    net.init_topic(&app_handle, user_id)
        .await
        .map_err(|e| e.to_string())?;
    drop(net);

    Ok(())
}

/// Loads the stored endpoint for the user.
///
/// # Note
/// This should be called only if the user already exists.
#[tauri::command]
pub async fn load_endpoint(app_handle: AppHandle, user_id: i64) -> StringResult<()> {
    tauri::async_runtime::spawn(async move {
        let net: NetworkState = app_handle.state::<Arc<Mutex<Network>>>();
        let mut net = net.lock().await;
        net.init_endpoint(&app_handle, user_id)
            .await
            .unwrap_or_else(|e| eprintln!("{e}"));
        net.load_topic(&app_handle, user_id)
            .await
            .unwrap_or_else(|e| eprintln!("{e}"));
        drop(net);
    });

    Ok(())
}

/// Gets the endpoint address for the specfied user.
#[tauri::command]
pub async fn get_endpoint_addr(
    db: DatabaseState<'_>,
    user_id: i64,
) -> StringResult<Option<String>> {
    db.get_endpoint_node(user_id)
        .await
        .map_err(|e| e.to_string())
}

/// Closes the endpoint.
#[tauri::command]
pub async fn close_endpoint(app_handle: AppHandle) -> StringResult<()> {
    let net: NetworkState = app_handle.state::<Arc<Mutex<Network>>>();
    let mut net = net.lock().await;
    net.close().await;
    drop(net);
    Ok(())
}
