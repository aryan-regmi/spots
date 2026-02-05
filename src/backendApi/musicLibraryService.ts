import { Context, Data, Effect } from 'effect';

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
};

/** Represents an error in the `PlaylistService`. */
export class MusicLibraryServiceError extends Data.TaggedError(
  'PlaylistServiceError'
)<{
  message: string;
}> {}

/** Service that handles all playlist operations. */
export class MusicLibraryService extends Context.Tag('MusicLibraryService')<
  MusicLibraryService,
  {
    /** Gets the specified playlist. */
    getPlaylist: (
      playlistId: string
    ) => Effect.Effect<Playlist, MusicLibraryServiceError>;

    /** Gets the specified track. */
    getTrack: (
      trackId: string
    ) => Effect.Effect<Track, MusicLibraryServiceError>;

    /** Gets the recently played playlists. */
    getRecentPlaylists: (
      username: string
    ) => Effect.Effect<Playlist[], MusicLibraryServiceError>;

    /** Gets the pinned playlists. */
    getPinnedPlaylists: (
      username: string
    ) => Effect.Effect<Playlist[], MusicLibraryServiceError>;

    /** Follows/unfollows the specified playlist for the user. */
    toggleFollowPlaylist: (
      username: string,
      playlistId: string
    ) => Effect.Effect<boolean, MusicLibraryServiceError>;

    /** Creates a new playlist. */
    createPlaylist: (
      playlist: Partial<Playlist>
    ) => Effect.Effect<void, MusicLibraryServiceError>;

    /** Adds a track to the music library. */
    addTrack: (
      track: Partial<Track>
    ) => Effect.Effect<void, MusicLibraryServiceError>;

    /** Adds the track to the specified playlist. */
    addTrackToPlaylist: (
      trackId: string,
      playlistId: string
    ) => Effect.Effect<void, MusicLibraryServiceError>;
  }
>() {}

/** Returns a program that requires a `PlaylistService` implementation provided to run. */
export const playlistServiceProgram = Effect.gen(function* () {
  const playlistService = yield* MusicLibraryService;
  return playlistService;
});
