use sqlx::Sqlite;
use uuid::Uuid;

use crate::{
    api::utils::ResponseChannel,
    database::{
        client::DatabaseClient,
        models::music_library::{Album, Artist, Track},
        stream_rows, DBResult,
    },
};

/// Database operations for [Album].
pub trait AlbumExt {
    /// Gets the specified album.
    async fn get_album(&self, album_id: Uuid) -> DBResult<Option<Album>>;

    /// Gets the tracks for the album.
    async fn get_album_tracks(
        &self,
        album_id: Uuid,
        channel: ResponseChannel<Track>,
    ) -> DBResult<()>;

    /// Gets the artists for the album.
    async fn get_album_artists(
        &self,
        album_id: Uuid,
        channel: ResponseChannel<Artist>,
    ) -> DBResult<()>;

    /// Gets all the album in the DB.
    async fn get_all_albums(&self, channel: ResponseChannel<Album>) -> DBResult<()>;
}

impl AlbumExt for DatabaseClient {
    async fn get_album(&self, album_id: Uuid) -> DBResult<Option<Album>> {
        let album: Option<Album> = sqlx::query_as("SELECT * FROM albums WHERE id = $1")
            .bind(album_id.to_string())
            .fetch_optional(&self.pool)
            .await?;
        Ok(album)
    }

    async fn get_album_tracks(
        &self,
        album_id: Uuid,
        channel: ResponseChannel<Track>,
    ) -> DBResult<()> {
        let album_tracks = sqlx::query_as::<Sqlite, Track>(
            "
            SELECT t.*
            FROM tracks t
            WHERE t.album_id = $1
            ",
        )
        .bind(album_id.to_string())
        .fetch(&self.pool);

        // Stream track to the channel
        stream_rows(album_tracks, channel).await?;

        Ok(())
    }

    async fn get_album_artists(
        &self,
        album_id: Uuid,
        channel: ResponseChannel<Artist>,
    ) -> DBResult<()> {
        let artists = sqlx::query_as::<Sqlite, Artist>(
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

        stream_rows(artists, channel).await?;

        Ok(())
    }

    async fn get_all_albums(&self, channel: ResponseChannel<Album>) -> DBResult<()> {
        let albums = sqlx::query_as::<Sqlite, Album>("SELECT * FROM albums").fetch(&self.pool);
        stream_rows(albums, channel).await?;
        Ok(())
    }
}
