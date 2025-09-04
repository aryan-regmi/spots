/** The metadata of a track. */
export type TrackMetadata = {
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
    year?: string;
    coverBase64?: string;
    path: string;
};

/** The metadata format streamed from the backend. */
type StreamedTrackMetadata = {
    id: number;
    metadata: TrackMetadata;
};

export default StreamedTrackMetadata;
