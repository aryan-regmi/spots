use sqlx::Sqlite;
use uuid::Uuid;

use crate::{
    api::utils::ResponseChannel,
    database::{
        client::DatabaseClient,
        models::music_library::{Artist, Genre, Track},
        stream_rows, DBResult,
    },
};

/// Database operations for [Track].
pub trait TrackExt {
    /// Gets the specified track from the DB.
    async fn get_track(&self, track_id: Uuid) -> DBResult<Option<Track>>;

    /// Gets the user's favorited tracks.
    ///
    /// # Note
    /// The tracks are all streamed to the `channel`.
    async fn get_favorited_tracks(
        &self,
        user_id: Uuid,
        channel: ResponseChannel<Track>,
    ) -> Result<(), sqlx::Error>;

    /// Gets all of the artists for the specified track.
    async fn get_track_artists(&self, track_id: Uuid) -> DBResult<Vec<Artist>>;

    /// Gets the track's genres.
    async fn get_track_genres(&self, track_id: Uuid) -> DBResult<Vec<Genre>>;

    /// Gets all of the tracks in the DB.
    async fn get_all_tracks(&self, channel: ResponseChannel<Track>) -> DBResult<()>;

    /// Streams the specified track.
    async fn stream_audio(&self, track_id: Uuid, channel: ResponseChannel<Vec<u8>>)
        -> DBResult<()>;

    // TODO: Add `get_last_played` for Tracks and Playlists!
}

impl TrackExt for DatabaseClient {
    async fn get_track(&self, track_id: Uuid) -> DBResult<Option<Track>> {
        let track: Option<Track> = sqlx::query_as("SELECT * FROM tracks WHERE id = $1")
            .bind(track_id.to_string())
            .fetch_optional(&self.pool)
            .await?;
        Ok(track)
    }

    async fn get_favorited_tracks(
        &self,
        user_id: Uuid,
        channel: ResponseChannel<Track>,
    ) -> DBResult<()> {
        let favorited_tracks = sqlx::query_as::<Sqlite, Track>(
            "
            SELECT t.*
            FROM tracks t
            LEFT JOIN favorited_tracks ft ON t.id = ft.track_id
            WHERE ft.user_id = $1
            ",
        )
        .bind(user_id.to_string())
        .fetch(&self.pool);

        // Stream track to the channel
        stream_rows(favorited_tracks, channel).await?;

        Ok(())
    }

    async fn get_track_artists(&self, track_id: Uuid) -> DBResult<Vec<Artist>> {
        let track_artists: Vec<Artist> = sqlx::query_as(
            "
            SELECT a.*
            FROM artists a
            LEFT JOIN track_artists ta ON a.id = ta.artist_id
            WHERE ta.track_id = $1
            ",
        )
        .bind(track_id.to_string())
        .fetch_all(&self.pool)
        .await?;
        Ok(track_artists)
    }

    async fn get_track_genres(&self, track_id: Uuid) -> DBResult<Vec<Genre>> {
        let track_genres: Vec<Genre> = sqlx::query_as(
            "
            SELECT g.*
            FROM genres g
            LEFT JOIN track_genres tg ON g.name = tg.genre
            WHERE tg.track_id = $1
            ",
        )
        .bind(track_id.to_string())
        .fetch_all(&self.pool)
        .await?;
        Ok(track_genres)
    }

    async fn get_all_tracks(&self, channel: ResponseChannel<Track>) -> DBResult<()> {
        let tracks = sqlx::query_as::<Sqlite, Track>("SELECT * FROM tracks").fetch(&self.pool);

        // Stream track to the channel
        stream_rows(tracks, channel).await?;

        Ok(())
    }

    async fn stream_audio(
        &self,
        track_id: Uuid,
        channel: ResponseChannel<Vec<u8>>,
    ) -> DBResult<()> {
        let track = self.get_track(track_id).await?;
        if let Some(track) = track {}

        // TODO: Get track from db
        //  - read track file
        //  - stream the bytes back
        todo!()
    }
}
