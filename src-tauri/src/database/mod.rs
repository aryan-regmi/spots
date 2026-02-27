pub mod albums;
pub mod client;
pub mod models;
pub mod playlists;
pub mod tracks;
pub mod users;

pub(crate) type DBResult<T> = Result<T, sqlx::Error>;
