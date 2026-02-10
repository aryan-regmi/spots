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

/** Represents a playlist in the music library. */
export type Playlist = Partial<Omit<PlaylistRecord, 'id' | 'isCurrent'>> & {
  id: string;
  isCurrent: boolean;
};

/** Represents a track in the music library. */
export type Track = Partial<Omit<TrackRecord, 'id' | 'src' | 'isCurrent'>> & {
  id: string;
  src: string;
  isCurrent: boolean;
};

/** The ID of a track. */
export type TrackID = { trackId: string };

/** The ID of a user. */
export type UserID =
  | { kind: 'id'; id: string }
  | { kind: 'name'; name: string };

/** Represents a user's music library. */
export type MusicLibrary = {
  playlists: Playlist[];
  tracks: Track[];
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
  addTrack: (track: Track) => ResultAsync<TrackID, MusicLibraryError>;

  /** Gets the specified track from the library. */
  getTrack: (trackId: TrackID) => ResultAsync<Track, MusicLibraryError>;

  /** Updates the specified track to the new value. */
  updateTrack: (
    trackId: TrackID,
    value: Track
  ) => ResultAsync<void, MusicLibraryError>;

  /** Removes the specified track from the library.
   *
   * # Note
   * The deleted track is returned if the delete was successful.
   * */
  removeTrack: (trackId: TrackID) => ResultAsync<Track, MusicLibraryError>;

  /** Adds the given tracks to the specified playlist. */
  addTracksToPlaylist: (
    trackIds: TrackID | TrackID[],
    playlistId: PlaylistID
  ) => ResultAsync<void, MusicLibraryError>;

  /** Removes the given tracks from the specified playlist. */
  removeTracksFromPlaylist: (
    trackIds: TrackID | TrackID[],
    playlistId: PlaylistID
  ) => ResultAsync<Track[], MusicLibraryError>;

  /** Adds a new playlist to the library. */
  addPlaylist: (
    playlist: Playlist
  ) => ResultAsync<PlaylistID, MusicLibraryError>;

  /** Gets the specified playlist from the library. */
  getPlaylist: (
    playlistId: PlaylistID
  ) => ResultAsync<Playlist, MusicLibraryError>;

  /** Updates the specified playlist to the new value. */
  updatePlaylist: (
    playlistId: PlaylistID,
    value: Playlist
  ) => ResultAsync<void, MusicLibraryError>;

  /** Removes the specified playlist from the library.
   *
   * # Note
   * The deleted playlist is returned if the delete was successful.
   * */
  removePlaylist: (
    playlistId: PlaylistID
  ) => ResultAsync<Playlist, MusicLibraryError>;

  /** Make the specified user follow the playlist. */
  followPlaylist: (
    userId: UserID,
    playlistID: PlaylistID
  ) => ResultAsync<void, MusicLibraryError>;

  /** Make the specified user un-follow the playlist. */
  unfollowPlaylist: (
    userId: UserID,
    playlistID: PlaylistID
  ) => ResultAsync<void, MusicLibraryError>;

  /** Make the specified user pin the playlist. */
  pinPlaylist: (
    userId: UserID,
    playlistID: PlaylistID
  ) => ResultAsync<void, MusicLibraryError>;

  /** Make the specified user un-pin the playlist. */
  unpinPlaylist: (
    userId: UserID,
    playlistID: PlaylistID
  ) => ResultAsync<void, MusicLibraryError>;

  /** Gets all tracks in the user's library. */
  getAllTracks: (userId: UserID) => ResultAsync<Track[], MusicLibraryError>;

  /** Gets all playlists in the user's library. */
  getAllPlaylists: (
    userId: UserID
  ) => ResultAsync<Playlist[], MusicLibraryError>;
}
