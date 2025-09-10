use futures::StreamExt;
use tauri::{path::BaseDirectory, AppHandle, Emitter, Manager, State};
use tokio::fs;

use crate::{
    database::{Database, StreamedTrackMetadata},
    music::TrackMetadata,
};

type Result<T> = anyhow::Result<T, String>;
type DatabaseState<'a> = State<'a, Database>;

/// Loads the music library and saves each track to the database.
#[tauri::command]
pub async fn load_music_library(
    app_handle: AppHandle,
    window: tauri::Window,
    db: DatabaseState<'_>,
    user_id: i64,
) -> Result<()> {
    // Read the music directory
    let path_resolver = app_handle.path();
    let music_dir = path_resolver
        .resolve("Music/", BaseDirectory::Home)
        .map_err(|e| e.to_string())?;
    if !music_dir.exists() {
        fs::create_dir_all(music_dir.as_path())
            .await
            .map_err(|e| e.to_string())?;
    }
    let mut entries = fs::read_dir(music_dir.as_path())
        .await
        .map_err(|e| e.to_string())?;

    // Create default `All Songs` playlist
    let all_songs_playlist_id = db
        .insert_playlist("All Songs".into(), user_id)
        .await
        .map_err(|e| e.to_string())?;

    // Parse metadata from each audio file
    while let Ok(Some(entry)) = entries.next_entry().await {
        let path = entry.path();
        if path
            .extension()
            .map(|ext| ext == "mp3")
            .unwrap_or_else(|| false)
        {
            let metadata = TrackMetadata::parse_metadata(
                path.to_str()
                    .ok_or_else(|| format!("Failed to parse path: {path:?}"))?,
            )
            .map_err(|e| e.to_string())?;

            // Add to track database
            let inserted = db
                .insert_track(metadata.clone(), user_id)
                .await
                .map_err(|e| e.to_string())?;
            let track_id = inserted.last_insert_rowid();

            // Add track to the default `All Songs` playlist
            db.add_track_to_playlist(track_id, all_songs_playlist_id)
                .await
                .map_err(|e| e.to_string())?;

            // Emit loaded event
            if inserted.rows_affected() >= 1 {
                window
                    .emit(
                        "track-stream",
                        StreamedTrackMetadata {
                            id: inserted.last_insert_rowid(),
                            metadata,
                        },
                    )
                    .map_err(|e| e.to_string())?;
            }
        }
    }

    Ok(())
}

/// Streams all the tracks in the library from the database.
#[tauri::command]
pub async fn stream_all_tracks(window: tauri::Window, db: DatabaseState<'_>) -> Result<()> {
    let mut tracks_stream = db.stream_all_tracks().await;
    while let Some(Ok(track)) = tracks_stream.next().await {
        window
            .emit("track-stream", track)
            .map_err(|e| e.to_string())?;
    }
    window
        .emit("track-stream-stopped", ())
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// Streams all the playlists in the user's library.
#[tauri::command]
pub async fn stream_playlists(
    window: tauri::Window,
    db: DatabaseState<'_>,
    user_id: i64,
) -> Result<()> {
    let mut playlists_stream = db.stream_playlists(user_id).await;
    while let Some(Ok(playlist)) = playlists_stream.next().await {
        window
            .emit("playlist-stream", playlist)
            .map_err(|e| e.to_string())?;
    }
    window
        .emit("playlist-stream-stopped", ())
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// Streams all the tracks from the specified playlist.
#[tauri::command]
pub async fn stream_playlist_tracks(
    window: tauri::Window,
    db: DatabaseState<'_>,
    playlist_id: i64,
) -> Result<()> {
    let mut tracks_stream = db.stream_tracks(playlist_id).await;
    while let Some(Ok(track)) = tracks_stream.next().await {
        window
            .emit("playlist-track-stream", track)
            .map_err(|e| e.to_string())?;
    }
    window
        .emit("playlist-track-stream-stopped", ())
        .map_err(|e| e.to_string())?;

    Ok(())
}
