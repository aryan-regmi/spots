/** The metadata of a track. */
type TrackMetadata = {
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
    year?: string;
    coverBase64?: string;
    path: string;
};

export default TrackMetadata;
