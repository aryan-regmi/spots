use futures_util::StreamExt;
use sqlx::Sqlite;
use tauri::ipc::Channel;
use uuid::Uuid;

use crate::database::{
    client::DatabaseClient,
    models::music_library::{Playlist, PlaylistTrack, Track},
    DBResult,
};

/// Database operations for [Playlist].
pub trait PlaylistExt {
    /// Gets the specified playlist from the DB.
    async fn get_playlist(&self, playlist_id: Uuid) -> DBResult<Option<Playlist>>;

    /// Gets all the tracks in the playlist.
    ///
    /// The tracks are accompanied by their order in the playlist.
    ///
    /// # Note
    /// The tracks are all streamed to the `channel`.
    async fn get_playlist_tracks(
        &self,
        playlist_id: Uuid,
        channel: Channel<PlaylistTrack>,
    ) -> DBResult<()>;

    /// Gets all of the user's pinned playlists.
    async fn get_pinned_playlists(&self, user_id: Uuid) -> DBResult<Vec<Playlist>>;

    /// Gets all of the user's playlists.
    async fn get_all_playlists(&self, user_id: Uuid, channel: Channel<Playlist>) -> DBResult<()>;
}

impl PlaylistExt for DatabaseClient {
    async fn get_playlist(&self, playlist_id: Uuid) -> DBResult<Option<Playlist>> {
        let playlist: Option<Playlist> = sqlx::query_as("SELECT * FROM playlists WHERE id = $1")
            .bind(playlist_id.to_string())
            .fetch_optional(&self.pool)
            .await?;
        Ok(playlist)
    }

    async fn get_playlist_tracks(
        &self,
        playlist_id: Uuid,
        channel: Channel<PlaylistTrack>,
    ) -> DBResult<()> {
        let mut playlist_tracks = sqlx::query_as::<Sqlite, PlaylistTrack>(
            "
            SELECT pt.track_order, t.*
            FROM tracks t
            LEFT JOIN playlist_tracks pt ON t.id = pt.track_id
            WHERE pt.playlist_id = $1
            ",
        )
        .bind(playlist_id.to_string())
        .fetch(&self.pool);

        // Stream track to the channel
        while let Some(row) = playlist_tracks.next().await {
            match row {
                Ok(track) => channel
                    .send(track)
                    .map_err(|e| sqlx::Error::Decode(e.into()))?,
                Err(err) => return Err(err),
            }
        }

        Ok(())
    }

    async fn get_pinned_playlists(&self, user_id: Uuid) -> DBResult<Vec<Playlist>> {
        let pinned_playlists: Vec<Playlist> = sqlx::query_as(
            "
            SELECT p.*
            FROM playlists p
            LEFT JOIN pinned_playlists pp ON p.id = pp.playlist_id
            WHERE pp.user_id = $1
            ",
        )
        .bind(user_id.to_string())
        .fetch_all(&self.pool)
        .await?;

        Ok(pinned_playlists)
    }

    async fn get_all_playlists(&self, user_id: Uuid, channel: Channel<Playlist>) -> DBResult<()> {
        let mut playlists = sqlx::query_as::<Sqlite, Playlist>(
            "
            SELECT *
            FROM playlists 
            WHERE user_id = $1
            ",
        )
        .bind(user_id.to_string())
        .fetch(&self.pool);

        // Stream track to the channel
        while let Some(row) = playlists.next().await {
            match row {
                Ok(playlist) => channel
                    .send(playlist)
                    .map_err(|e| sqlx::Error::Decode(e.into()))?,
                Err(err) => return Err(err),
            }
        }

        Ok(())
    }
}
