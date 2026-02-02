import { Context, Data, Effect } from 'effect';

/** Represents a track in a playlist. */
export type Track = {
  id: string;
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
};

/** Represents an error in the `PlaylistService`. */
export class PlaylistServiceError extends Data.TaggedError(
  'PlaylistServiceError'
)<{
  message: string;
}> {}

/** Service that handles all playlist operations. */
export class PlaylistService extends Context.Tag('PlaylistService')<
  PlaylistService,
  {
    /** Gets the recently played playlists. */
    getRecentPlaylists: (
      username: string
    ) => Effect.Effect<Playlist[], PlaylistServiceError, never>;

    /** Gets the pinned playlists. */
    getPinnedPlaylists: (
      username: string
    ) => Effect.Effect<Playlist[], PlaylistServiceError, never>;

    /** Gets the tracks in the specified playlist. */
    getPlaylistTracks: (
      playlistId: string
    ) => Effect.Effect<Track[], PlaylistServiceError, never>;
  }
>() {}

/** Returns a program that requires a `PlaylistService` implementation provided to run. */
export const playlistServiceProgram = Effect.gen(function* () {
  const playlistService = yield* PlaylistService;
  return playlistService;
});
