use uuid::Uuid;

use crate::database::{
    client::DatabaseClient,
    models::music_library::{Artist, Genre, Track},
};

/// Database operations for [Track]
pub trait TrackExt {
    /// Gets the specified track from the DB.
    async fn get_track(&self, track_id: Uuid) -> Result<Option<Track>, sqlx::Error>;

    /// Gets the user's favorited tracks
    async fn get_favorited_tracks(&self, user_id: Uuid) -> Result<Vec<Track>, sqlx::Error>;

    /// Gets all of the artists for the specified track.
    async fn get_track_artists(&self, track_id: Uuid) -> Result<Vec<Artist>, sqlx::Error>;

    /// Gets the track's genres.
    async fn get_track_genres(&self, track_id: Uuid) -> Result<Vec<Genre>, sqlx::Error>;
}

impl TrackExt for DatabaseClient {
    async fn get_track(&self, track_id: Uuid) -> Result<Option<Track>, sqlx::Error> {
        let track: Option<Track> = sqlx::query_as(
            "
        SELECT *
        FROM tracks
        WHERE id = $1
            ",
        )
        .bind(track_id.to_string())
        .fetch_optional(&self.pool)
        .await?;
        todo!()
    }

    async fn get_favorited_tracks(&self, user_id: Uuid) -> Result<Vec<Track>, sqlx::Error> {
        todo!()
    }

    async fn get_track_artists(&self, track_id: Uuid) -> Result<Vec<Artist>, sqlx::Error> {
        todo!()
    }

    async fn get_track_genres(&self, track_id: Uuid) -> Result<Vec<Genre>, sqlx::Error> {
        todo!()
    }
}
