use futures_util::stream::StreamExt;
use sqlx::Sqlite;
use tauri::ipc::Channel;
use uuid::Uuid;

use crate::database::{
    client::DatabaseClient,
    models::music_library::{Artist, Genre, Track},
    DBResult,
};

#[allow(dead_code)] // FIXME: REMOVE!
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
        channel: Channel<Track>,
    ) -> Result<(), sqlx::Error>;

    /// Gets all of the artists for the specified track.
    async fn get_track_artists(&self, track_id: Uuid) -> DBResult<Vec<Artist>>;

    /// Gets the track's genres.
    async fn get_track_genres(&self, track_id: Uuid) -> DBResult<Vec<Genre>>;

    /// Gets all of the tracks in the DB.
    async fn get_all_tracks(&self, channel: Channel<Track>) -> DBResult<()>;
}

impl TrackExt for DatabaseClient {
    async fn get_track(&self, track_id: Uuid) -> DBResult<Option<Track>> {
        let track: Option<Track> = sqlx::query_as("SELECT * FROM tracks WHERE id = $1")
            .bind(track_id.to_string())
            .fetch_optional(&self.pool)
            .await?;
        Ok(track)
    }

    async fn get_favorited_tracks(&self, user_id: Uuid, channel: Channel<Track>) -> DBResult<()> {
        let mut favorited_tracks = sqlx::query_as::<Sqlite, Track>(
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
        while let Some(row) = favorited_tracks.next().await {
            match row {
                Ok(track) => channel
                    .send(track)
                    .map_err(|e| sqlx::Error::Decode(e.into()))?,
                Err(err) => return Err(err),
            }
        }

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

    async fn get_all_tracks(&self, channel: Channel<Track>) -> DBResult<()> {
        let mut tracks = sqlx::query_as::<Sqlite, Track>("SELECT * FROM tracks").fetch(&self.pool);

        // Stream track to the channel
        while let Some(row) = tracks.next().await {
            match row {
                Ok(track) => channel
                    .send(track)
                    .map_err(|e| sqlx::Error::Decode(e.into()))?,
                Err(err) => return Err(err),
            }
        }

        Ok(())
    }
}
