import { ResultAsync } from 'neverthrow';

/** Represents a track in a playlist. */
export type Track = {
  id: string;
  src: string;
  imgSrc?: string;
  title?: string;
  artist?: string;
  album?: string;
};

/** Represents a playlist. */
export type Playlist = {
  id: string;
  name: string;
  imgSrc?: string;
  createdBy: string;
  tracks: string[];
  followers: string[];
  pinned: string[];
  lastPlayed?: number;
};

/** Represents an error in the music library service. */
export class MusicLibraryServiceError extends Error {}
export interface MusicLibraryServiceError {
  message: string;
}

// TODO: Add functions to getAllPlaylists + getAllTracks

/** Service that handles all playlist operations. */
export type MusicLibraryService = {
  /** Determines if the service is ready. */
  isReady: boolean;

  /** Gets the specified playlist. */
  getPlaylist: (
    playlistId: string
  ) => ResultAsync<Playlist | undefined, MusicLibraryServiceError>;

  /** Gets the specified track. */
  getTrack: (
    trackId: string
  ) => ResultAsync<Track | undefined, MusicLibraryServiceError>;

  /** Gets the recently played playlists. */
  getRecentPlaylists: (
    userId: string
  ) => ResultAsync<Playlist[], MusicLibraryServiceError>;

  /** Gets the pinned playlists. */
  getPinnedPlaylists: (
    userId: string
  ) => ResultAsync<Playlist[], MusicLibraryServiceError>;

  /** Follows/unfollows the specified playlist for the user. */
  toggleFollowPlaylist: (
    userId: string,
    playlistId: string
  ) => ResultAsync<{ following: boolean }, MusicLibraryServiceError>;

  /** Creates a new playlist. */
  createPlaylist: (
    playlist: Omit<Playlist, 'id'>
  ) => ResultAsync<{ playlistId: string }, MusicLibraryServiceError>;

  /** Adds a track to the music library. */
  addTrack: (
    track: Omit<Track, 'id'>
  ) => ResultAsync<{ trackId: string }, MusicLibraryServiceError>;

  /** Adds the track to the specified playlist. */
  addTrackToPlaylist: (
    trackId: string,
    playlistId: string
  ) => ResultAsync<void, MusicLibraryServiceError>;
};
