use futures_util::StreamExt;
use sqlx::Sqlite;
use tauri::ipc::Channel;
use uuid::Uuid;

use crate::database::{
    client::DatabaseClient,
    models::music_library::{Artist, Track},
    DBResult,
};

/// Database operations for [Album].
pub trait AlbumExt {
    /// Gets the tracks for the album.
    async fn get_album_tracks(&self, album_id: Uuid, channel: Channel<Track>) -> DBResult<()>;

    /// Gets the artists for the album.
    async fn get_album_artists(&self, album_id: Uuid, channel: Channel<Artist>) -> DBResult<()>;
}

impl AlbumExt for DatabaseClient {
    async fn get_album_tracks(&self, album_id: Uuid, channel: Channel<Track>) -> DBResult<()> {
        let mut album_tracks = sqlx::query_as::<Sqlite, Track>(
            "
            SELECT t.*
            FROM tracks t
            WHERE t.album_id = $1
            ",
        )
        .bind(album_id.to_string())
        .fetch(&self.pool);

        // Stream track to the channel
        while let Some(row) = album_tracks.next().await {
            match row {
                Ok(track) => channel
                    .send(track)
                    .map_err(|e| sqlx::Error::Decode(e.into()))?,
                Err(err) => return Err(err),
            }
        }

        Ok(())
    }

    async fn get_album_artists(&self, album_id: Uuid, channel: Channel<Artist>) -> DBResult<()> {
        let mut artists = sqlx::query_as::<Sqlite, Artist>(
            "
        SELECT DISTINCT a.*
        FROM albums al
        JOIN tracks t ON al.id = t.album_id
        JOIN track_artists ta ON t.id = ta.track_id
        JOIN artists a ON ta.artist_id = a.id
        WHERE al.id = $1
        ",
        )
        .bind(album_id.to_string())
        .fetch(&self.pool);

        while let Some(row) = artists.next().await {
            match row {
                Ok(artist) => channel
                    .send(artist)
                    .map_err(|e| sqlx::Error::Decode(e.into()))?,
                Err(err) => return Err(err),
            }
        }

        Ok(())
    }
}
