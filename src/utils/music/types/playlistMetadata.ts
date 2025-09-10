/** The metadata of a playlist. */
export type PlaylistMetadata = {
  userId?: number;
  networkId?: number;
  name?: string;
};

/** The playlist metadata format streamed from the backend. */
type StreamedPlaylistMetadata = {
  id: number;
  metadata: PlaylistMetadata;
};

export default StreamedPlaylistMetadata;
