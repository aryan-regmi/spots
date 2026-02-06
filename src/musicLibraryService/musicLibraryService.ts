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
  pinned: boolean;
  lastPlayed: number;
};

/** Represents an error in the music library service. */
export interface MusicLibraryServiceError {
  message: string;
}

/** Service that handles all playlist operations. */
export type MusicLibraryService = {
  /** Gets the specified playlist. */
  getPlaylist: (
    playlistId: string
  ) => ResultAsync<Playlist, MusicLibraryServiceError>;

  /** Gets the specified track. */
  getTrack: (trackId: string) => ResultAsync<Track, MusicLibraryServiceError>;

  /** Gets the recently played playlists. */
  getRecentPlaylists: (
    username: string
  ) => ResultAsync<Playlist[], MusicLibraryServiceError>;

  /** Gets the pinned playlists. */
  getPinnedPlaylists: (
    username: string
  ) => ResultAsync<Playlist[], MusicLibraryServiceError>;

  /** Follows/unfollows the specified playlist for the user. */
  toggleFollowPlaylist: (
    username: string,
    playlistId: string
  ) => ResultAsync<boolean, MusicLibraryServiceError>;

  /** Creates a new playlist. */
  createPlaylist: (
    playlist: Partial<Playlist>
  ) => ResultAsync<string, MusicLibraryServiceError>;

  /** Adds a track to the music library. */
  addTrack: (
    track: Partial<Track>
  ) => ResultAsync<string, MusicLibraryServiceError>;

  /** Adds the track to the specified playlist. */
  addTrackToPlaylist: (
    trackId: string,
    playlistId: string
  ) => ResultAsync<void, MusicLibraryServiceError>;
};
