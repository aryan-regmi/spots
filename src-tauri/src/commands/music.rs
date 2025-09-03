use tauri::Emitter;
use tokio::fs;

use crate::music::parse_metadata;

type Result<T> = anyhow::Result<T, String>;

/// Loads the music library and streams each loaded track.
#[tauri::command]
pub async fn load_music_library(window: tauri::Window) -> Result<()> {
    let music_dir_path = "$HOME/Music/";
    let music_dir_exists = fs::try_exists(music_dir_path)
        .await
        .map_err(|e| e.to_string())?;
    if !music_dir_exists {
        fs::create_dir_all(music_dir_path)
            .await
            .map_err(|e| e.to_string())?;
    }
    let mut entries = fs::read_dir(music_dir_path)
        .await
        .map_err(|e| e.to_string())?;

    if let Ok(entry) = entries.next_entry().await {
        if let Some(entry) = entry {
            let path = entry.path();
            if path.extension().map(|ext| ext == "mp3").unwrap_or(false) {
                match parse_metadata(
                    path.to_str()
                        .ok_or_else(|| format!("Failed to parse path: {path:?}"))?,
                ) {
                    Ok(metadata) => window
                        .emit("track-loaded", metadata)
                        .map_err(|e| e.to_string())?,
                    Err(e) => eprintln!("Failed to parse {}: {}", path.display(), e),
                }
            }
        }
    }

    Ok(())
}
