use tauri::State;
use uuid::Uuid;

use crate::{
    api::utils::{token::verify_token, ApiResponse, ApiResult, ResponseChannel},
    database::{
        albums::AlbumExt,
        models::music_library::{Album, Artist, Genre, Playlist, PlaylistTrack, Track},
        playlists::PlaylistExt,
        tracks::TrackExt,
    },
    AppState,
};

/// Gets the specified playlist.
#[tauri::command]
pub async fn get_playlist(
    state: State<'_, AppState>,
    auth_token: String,
    playlist_id: Uuid,
) -> ApiResult<Option<Playlist>> {
    // Verify auth token
    verify_token(&state, auth_token).await?;

    // Get playlist from DB
    let db = state.db.lock().await;
    db.get_playlist(playlist_id)
        .await
        .map(|playlist| ApiResponse::success(playlist))
}

/// Gets all tracks in the playlist.
///
/// # Note
/// The tracks are all streamed to the `channel`.
#[tauri::command]
pub async fn get_playlist_tracks(
    state: State<'_, AppState>,
    auth_token: String,
    playlist_id: Uuid,
    channel: ResponseChannel<PlaylistTrack>,
) -> ApiResult<()> {
    // Verify auth token
    verify_token(&state, auth_token).await?;

    // Get playlist from DB
    let db = state.db.lock().await;
    db.get_playlist_tracks(playlist_id, channel)
        .await
        .map(|_| ApiResponse::success(()))
}

/// Gets all of the authenticated user's pinned playlists.
#[tauri::command]
pub async fn get_pinned_playlists(
    state: State<'_, AppState>,
    auth_token: String,
) -> ApiResult<Vec<Playlist>> {
    // Verify auth token
    let token = verify_token(&state, auth_token).await?;

    // Get pinned playlists from DB
    let db = state.db.lock().await;
    db.get_pinned_playlists(token.get_user_id())
        .await
        .map(|playlists| ApiResponse::success(playlists))
}

/// Gets all of the authenticated user's playlists.
///
/// # Note
/// The actual playlists will be sent over the `channel`.
#[tauri::command]
pub async fn get_all_playlists(
    state: State<'_, AppState>,
    auth_token: String,
    channel: ResponseChannel<Playlist>,
) -> ApiResult<()> {
    // Verify auth token
    let token = verify_token(&state, auth_token).await?;

    // Get playlists from DB
    let db = state.db.lock().await;
    db.get_all_playlists(token.get_user_id(), channel)
        .await
        .map(|_| ApiResponse::success(()))
}

/// Gets the specified track.
#[tauri::command]
pub async fn get_track(
    state: State<'_, AppState>,
    auth_token: String,
    track_id: Uuid,
) -> ApiResult<Option<Track>> {
    // Verify auth token
    verify_token(&state, auth_token).await?;

    // Get track from DB
    let db = state.db.lock().await;
    db.get_track(track_id)
        .await
        .map(|track| ApiResponse::success(track))
}

/// Gets the user's favorited tracks.
///
/// # Note
/// The tracks are all streamed to the `channel`.
#[tauri::command]
pub async fn get_favorited_tracks(
    state: State<'_, AppState>,
    auth_token: String,
    channel: ResponseChannel<Track>,
) -> ApiResult<()> {
    // Verify auth token
    let token = verify_token(&state, auth_token).await?;

    // Get tracks from DB
    let db = state.db.lock().await;
    db.get_favorited_tracks(token.get_user_id(), channel)
        .await
        .map(|_| ApiResponse::success(()))
}

/// Gets the artists for the specified track.
#[tauri::command]
pub async fn get_track_artists(
    state: State<'_, AppState>,
    auth_token: String,
    track_id: Uuid,
) -> ApiResult<Vec<Artist>> {
    // Verify auth token
    verify_token(&state, auth_token).await?;

    // Get artits from DB
    let db = state.db.lock().await;
    db.get_track_artists(track_id)
        .await
        .map(|artists| ApiResponse::success(artists))
}

/// Gets the genres for the specified track.
#[tauri::command]
pub async fn get_track_genres(
    state: State<'_, AppState>,
    auth_token: String,
    track_id: Uuid,
) -> ApiResult<Vec<Genre>> {
    // Verify auth token
    verify_token(&state, auth_token).await?;

    // Get artits from DB
    let db = state.db.lock().await;
    db.get_track_genres(track_id)
        .await
        .map(|genres| ApiResponse::success(genres))
}

/// Gets the all of the tracks in the music library.
///
/// # Note
/// The tracks are all streamed to the `channel`.
#[tauri::command]
pub async fn get_all_tracks(
    state: State<'_, AppState>,
    auth_token: String,
    channel: ResponseChannel<Track>,
) -> ApiResult<()> {
    // Verify auth token
    verify_token(&state, auth_token).await?;

    // Get tracks from DB
    let db = state.db.lock().await;
    db.get_all_tracks(channel)
        .await
        .map(|_| ApiResponse::success(()))
}

/// Gets the audio data of the track as bytes.
#[tauri::command]
pub async fn get_audio_data(
    state: State<'_, AppState>,
    auth_token: String,
    track_id: Uuid,
) -> ApiResult<Vec<u8>> {
    // Verify auth token
    verify_token(&state, auth_token).await?;

    // Get audio data
    let db = state.db.lock().await;
    db.get_audio_data(track_id)
        .await
        .map(|bytes| ApiResponse::success(bytes))
}

/// Gets the specified album.
#[tauri::command]
pub async fn get_album(
    state: State<'_, AppState>,
    auth_token: String,
    album_id: Uuid,
) -> ApiResult<Option<Album>> {
    // Verify auth token
    verify_token(&state, auth_token).await?;

    // Get tracks from DB
    let db = state.db.lock().await;
    db.get_album(album_id)
        .await
        .map(|album| ApiResponse::success(album))
}

/// Gets the all of the tracks in the album.
///
/// # Note
/// The tracks are all streamed to the `channel`.
#[tauri::command]
pub async fn get_album_tracks(
    state: State<'_, AppState>,
    auth_token: String,
    album_id: Uuid,
    channel: ResponseChannel<Track>,
) -> ApiResult<()> {
    // Verify auth token
    verify_token(&state, auth_token).await?;

    // Get tracks from DB
    let db = state.db.lock().await;
    db.get_album_tracks(album_id, channel)
        .await
        .map(|_| ApiResponse::success(()))
}

/// Gets the all of the artists in the album.
///
/// # Note
/// The artists are all streamed to the `channel`.
#[tauri::command]
pub async fn get_album_artists(
    state: State<'_, AppState>,
    auth_token: String,
    album_id: Uuid,
    channel: ResponseChannel<Artist>,
) -> ApiResult<()> {
    // Verify auth token
    verify_token(&state, auth_token).await?;

    // Get tracks from DB
    let db = state.db.lock().await;
    db.get_album_artists(album_id, channel)
        .await
        .map(|_| ApiResponse::success(()))
}

/// Gets the all of the albums in the music library.
///
/// # Note
/// The albums are all streamed to the `channel`.
#[tauri::command]
pub async fn get_all_albums(
    state: State<'_, AppState>,
    auth_token: String,
    channel: ResponseChannel<Album>,
) -> ApiResult<()> {
    // Verify auth token
    verify_token(&state, auth_token).await?;

    // Get tracks from DB
    let db = state.db.lock().await;
    db.get_all_albums(channel)
        .await
        .map(|_| ApiResponse::success(()))
}
