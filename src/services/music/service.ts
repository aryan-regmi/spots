import { ResultAsync } from 'neverthrow';
import { PlaylistRecord, TrackRecord } from '../database/service';

/** The error returned from an authentication service. */
export interface MusicLibraryError {
  kind?: string;
  message: string;
  info?: any;
}

/** The ID of a playlist. */
export type PlaylistID = { playlistId: string };

/** The ID of a track. */
export type TrackID = { trackId: string };

/** The ID of a user. */
export type UserID =
  | { kind: 'id'; id: string }
  | { kind: 'name'; name: string };

/** Represents a user's music library. */
export type MusicLibrary = {
  playlists: PlaylistRecord[];
  tracks: TrackRecord[];
};

/** The state for the music service. */
export interface MusicLibraryState {
  /** If the state is ready (no music operations being done). */
  isReady: boolean;

  /** The current user's music library. */
  library: MusicLibrary;

  /** The current playlist being played. */
  currentPlaylist?: PlaylistID;

  /** The current track being played. */
  currentTrack?: TrackID;
}

/** Defines the interface for the music service. */
export interface MusicLibraryService {
  /** The music library state. */
  state: MusicLibraryState;

  // create read update delete

  /** Adds a new track to the library. */
  addTrack: (track: TrackRecord) => ResultAsync<void, MusicLibraryError>;

  /** Gets the specified track from the library. */
  getTrack: (
    trackId: TrackID
  ) => ResultAsync<TrackRecord | null, MusicLibraryError>;

  /** Updates the specified track to the new value. */
  updateTrack: (
    trackId: TrackID,
    value: TrackRecord
  ) => ResultAsync<void, MusicLibraryError>;

  /** Removes the specified track from the library.
   *
   * # Note
   * The deleted track is returned if the delete was successful.
   * */
  removeTrack: (
    trackId: TrackID
  ) => ResultAsync<TrackRecord, MusicLibraryError>;

  /** Adds the given tracks to the specified playlist. */
  addTracksToPlaylist: (
    trackIds: TrackID | TrackID[],
    playlistId: PlaylistID
  ) => ResultAsync<void, MusicLibraryError>;

  /** Removes the given tracks from the specified playlist. */
  removeTracksFromPlaylist: (
    trackIds: TrackID | TrackID[],
    playlistId: PlaylistID
  ) => ResultAsync<TrackRecord[], MusicLibraryError>;

  /** Adds a new playlist to the library. */
  addPlaylist: (
    playlist: PlaylistRecord
  ) => ResultAsync<void, MusicLibraryError>;

  /** Gets the specified playlist from the library. */
  getPlaylist: (
    playlistId: PlaylistID
  ) => ResultAsync<PlaylistRecord | null, MusicLibraryError>;

  /** Updates the specified playlist to the new value. */
  updatePlaylist: (
    playlistId: PlaylistID,
    value: PlaylistRecord
  ) => ResultAsync<void, MusicLibraryError>;

  /** Removes the specified playlist from the library.
   *
   * # Note
   * The deleted playlist is returned if the delete was successful.
   * */
  removePlaylist: (
    playlistId: PlaylistID
  ) => ResultAsync<PlaylistRecord, MusicLibraryError>;

  /** Make the specified user follow the playlist. */
  followPlaylist: (
    userId: UserID,
    playlistId: PlaylistID
  ) => ResultAsync<void, MusicLibraryError>;

  /** Make the specified user un-follow the playlist. */
  unfollowPlaylist: (
    userId: UserID,
    playlistId: PlaylistID
  ) => ResultAsync<void, MusicLibraryError>;

  /** Make the specified user pin the playlist. */
  pinPlaylist: (
    userId: UserID,
    playlistId: PlaylistID
  ) => ResultAsync<void, MusicLibraryError>;

  /** Make the specified user un-pin the playlist. */
  unpinPlaylist: (
    userId: UserID,
    playlistId: PlaylistID
  ) => ResultAsync<void, MusicLibraryError>;

  /** Gets all tracks in the user's library. */
  getAllTracks: (
    userId: UserID
  ) => ResultAsync<TrackRecord[], MusicLibraryError>;

  /** Gets all playlists in the user's library. */
  getAllPlaylists: (
    userId: UserID
  ) => ResultAsync<PlaylistRecord[], MusicLibraryError>;
}
