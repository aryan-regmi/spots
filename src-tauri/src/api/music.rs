use tauri::{ipc::Channel, State};
use uuid::Uuid;

use crate::{
    api::utils::{ApiResponse, ApiResult},
    database::{models::music_library::Playlist, playlists::PlaylistExt},
    AppState,
};

/// Gets the specified playlist.
pub async fn get_playlist(
    state: State<'_, AppState>,
    token_str: String,
    playlist_id: Uuid,
) -> ApiResult<Option<Playlist>> {
    todo!()
}

/// Gets all of the user's playlists.
///
/// # Note
/// The actual playlists will be sent over the `channel`.
#[tauri::command]
pub async fn get_all_playlists(
    state: State<'_, AppState>,
    token_str: String,
    user_id: Uuid,
    channel: Channel<Playlist>,
) -> ApiResult<()> {
    let db = state.db.lock().await;
    db.get_all_playlists(user_id, channel)
        .await
        .map(|_| ApiResponse::success(()))
        .map_err(|e| crate::errors::SpotsError::DatabaseError {
            database: db.path.clone(),
            error: e.to_string(),
        })
}
