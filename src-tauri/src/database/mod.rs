use futures_util::{Stream, StreamExt};
use serde::Serialize;

use crate::{
    api::utils::{ApiResponse, ApiResponseStatus, ResponseChannel},
    errors::SpotsError,
};

pub mod albums;
pub mod client;
pub mod models;
pub mod playlists;
pub mod tracks;
pub mod users;

pub type DBResult<T> = Result<T, SpotsError>;

/// Streams the rows to the given channel.
pub async fn stream_rows<T>(
    mut rows: impl Stream<Item = Result<T, sqlx::Error>> + Send + Unpin,
    channel: ResponseChannel<T>,
) -> Result<(), SpotsError>
where
    T: Serialize,
{
    // Signals the start of the stream
    channel
        .send(ApiResponse {
            status: ApiResponseStatus::Started,
            value: None,
        })
        .map_err(|e| SpotsError::ChannelError {
            channel_id: channel.id(),
            error: e.to_string(),
        })?;

    // The actual stream
    while let Some(row) = rows.next().await {
        match row {
            Ok(value) => channel
                .send(ApiResponse::pending(Some(value)))
                .map_err(|e| SpotsError::ChannelError {
                    channel_id: channel.id(),
                    error: e.to_string(),
                })?,
            Err(err) => {
                channel
                    .send(ApiResponse::failure(None))
                    .map_err(|e| SpotsError::ChannelError {
                        channel_id: channel.id(),
                        error: e.to_string(),
                    })?;
                return Err(SpotsError::from(err));
            }
        }
    }

    // Signals the end of the stream.
    channel
        .send(ApiResponse {
            status: ApiResponseStatus::Completed,
            value: None,
        })
        .map_err(|e| SpotsError::ChannelError {
            channel_id: channel.id(),
            error: e.to_string(),
        })?;

    Ok(())
}
