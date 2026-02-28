use std::pin::Pin;

use futures_util::{Stream, StreamExt};
use serde::Serialize;

use crate::api::utils::{ApiResponse, ApiResponseStatus, ResponseChannel};

pub mod albums;
pub mod client;
pub mod models;
pub mod playlists;
pub mod tracks;
pub mod users;

pub(crate) type DBResult<T> = Result<T, sqlx::Error>;

/// Streams the rows to the given channel.
pub async fn stream_rows<T>(
    mut rows: Pin<Box<dyn Stream<Item = Result<T, sqlx::Error>> + Send>>,
    channel: ResponseChannel<T>,
) -> Result<(), sqlx::Error>
where
    T: Serialize,
{
    // Signals the start of the stream
    channel
        .send(ApiResponse {
            status: ApiResponseStatus::Started,
            value: None,
        })
        .map_err(|e| sqlx::Error::Decode(e.into()))?;

    // The actual stream
    while let Some(row) = rows.next().await {
        match row {
            Ok(value) => channel
                .send(ApiResponse::pending(Some(value)))
                .map_err(|e| sqlx::Error::Decode(e.into()))?,
            Err(err) => {
                channel
                    .send(ApiResponse::failure(None))
                    .map_err(|e| sqlx::Error::Decode(e.into()))?;
                return Err(err);
            }
        }
    }

    // Signals the end of the stream.
    channel
        .send(ApiResponse {
            status: ApiResponseStatus::Completed,
            value: None,
        })
        .map_err(|e| sqlx::Error::Decode(e.into()))?;

    Ok(())
}
