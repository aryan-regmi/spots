use sqlx::Sqlite;
use uuid::Uuid;

use crate::{
    api::utils::ResponseChannel,
    database::{
        client::DatabaseClient,
        models::music_library::{Playlist, PlaylistTrack},
        stream_rows, DBResult,
    },
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
        channel: ResponseChannel<PlaylistTrack>,
    ) -> DBResult<()>;

    /// Gets all of the user's pinned playlists.
    async fn get_pinned_playlists(&self, user_id: Uuid) -> DBResult<Vec<Playlist>>;

    /// Gets all of the user's playlists.
    async fn get_all_playlists(
        &self,
        user_id: Uuid,
        channel: ResponseChannel<Playlist>,
    ) -> DBResult<()>;
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
        channel: ResponseChannel<PlaylistTrack>,
    ) -> DBResult<()> {
        let playlist_tracks = sqlx::query_as::<Sqlite, PlaylistTrack>(
            "
            SELECT pt.track_order, t.*
            FROM tracks t
            LEFT JOIN playlist_tracks pt ON t.id = pt.track_id
            WHERE pt.playlist_id = $1
            ",
        )
        .bind(playlist_id.to_string())
        .fetch(self.leak_pool());

        // Stream track to the channel
        stream_rows(playlist_tracks, channel).await?;

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

    async fn get_all_playlists(
        &self,
        user_id: Uuid,
        channel: ResponseChannel<Playlist>,
    ) -> DBResult<()> {
        let playlists = sqlx::query_as::<Sqlite, Playlist>(
            "
            SELECT *
            FROM playlists 
            WHERE user_id = $1
            ",
        )
        .bind(user_id.to_string())
        .fetch(self.leak_pool());

        // Stream track to the channel
        stream_rows(playlists, channel).await?;

        Ok(())
    }
}
