use base64::{engine::general_purpose, Engine};
use lofty::{file::TaggedFileExt, probe::Probe, tag::Accessor};
use serde::Serialize;

type Result<T> = anyhow::Result<T>;

#[derive(Serialize, Clone, Debug)]
pub struct TrackMetadata {
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub genre: Option<String>,
    pub year: Option<u32>,
    pub cover_base64: Option<String>,
    pub path: String,
}

impl TrackMetadata {
    /// Parses the metadata from the given audio file.
    pub fn parse_metadata(path: &str) -> Result<Self> {
        let tagged_file = Probe::open(path)?.read()?;

        let tag = tagged_file.primary_tag();

        // Try to get image data (cover)
        let cover_base64 = if let Some(pictures) = tag.and_then(|t| t.pictures().iter().next()) {
            Some(general_purpose::STANDARD.encode(pictures.data()))
        } else {
            None
        };

        Ok(TrackMetadata {
            title: tag.and_then(|t| t.title().map(|s| s.to_string())),
            artist: tag.and_then(|t| t.artist().map(|s| s.to_string())),
            album: tag.and_then(|t| t.album().map(|s| s.to_string())),
            genre: tag.and_then(|t| t.genre().map(|s| s.to_string())),
            year: tag.and_then(|t| t.year()),
            cover_base64,
            path: path.to_string(),
        })
    }
}

#[derive(Serialize, Clone, Debug)]
pub struct PlaylistMetadata {
    pub user_id: i64,
    pub network_id: i64,
    pub name: String,
}
