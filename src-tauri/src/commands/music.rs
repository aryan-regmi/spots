use futures::StreamExt;
use tauri::{path::BaseDirectory, AppHandle, Emitter, Manager, State};
use tokio::fs;

use crate::{
    database::{Database, StreamedTrackMetadata},
    music::parse_metadata,
};

type Result<T> = anyhow::Result<T, String>;
type DatabaseState<'a> = State<'a, Database>;

// TODO: Only load on signup then Save to database
//  - use database values otherwise
//  - update when database value becomes stale/invalid

/// Loads the music library and saves each track to the database.
#[tauri::command]
pub async fn load_music_library(
    app_handle: AppHandle,
    window: tauri::Window,
    db: DatabaseState<'_>,
    username: String,
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

    // Parse metadata from each audio file
    while let Ok(Some(entry)) = entries.next_entry().await {
        let path = entry.path();
        if path
            .extension()
            .map(|ext| ext == "mp3")
            .unwrap_or_else(|| false)
        {
            match parse_metadata(
                path.to_str()
                    .ok_or_else(|| format!("Failed to parse path: {path:?}"))?,
            ) {
                Ok(metadata) => {
                    // Add to database
                    let inserted = db
                        .insert_track(metadata.clone(), username.clone())
                        .await
                        .map_err(|e| e.to_string())?;

                    // Emit loaded event
                    if inserted.rows_affected() >= 1 {
                        window
                            .emit(
                                "track-loaded",
                                StreamedTrackMetadata {
                                    id: inserted.last_insert_rowid(),
                                    metadata,
                                },
                            )
                            .map_err(|e| e.to_string())?;
                    }
                }

                Err(error) => eprintln!("Failed to parse {}: {}", path.display(), error),
            }
        }
    }

    Ok(())
}

/// Streams all the tracks in the library from the database.
#[tauri::command]
pub async fn stream_tracks(window: tauri::Window, db: DatabaseState<'_>) -> Result<()> {
    let mut tracks_stream = db.stream_tracks().await;
    while let Some(Ok(track)) = tracks_stream.next().await {
        window
            .emit("track-loaded", track)
            .map_err(|e| e.to_string())?;
    }
    window
        .emit("track-stream-stopped", ())
        .map_err(|e| e.to_string())?;

    Ok(())
}
