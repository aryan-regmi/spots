import { mockPlaylists, mockTracks } from '@/mockUtils/playlists';
import { Effect } from 'effect';
import { PlaylistService, playlistServiceProgram } from './playlistService';

/** Gets the (up to) 12 most recently played playlists. */
const getRecentPlaylists = () =>
  Effect.gen(function* () {
    return yield* Effect.succeed(
      [...mockPlaylists, ...mockPlaylists].filter((e) => e !== undefined)
    );
  });

/** Gets the (up to) 6 pinned playlists. */
const getPinnedPlaylists = () =>
  Effect.gen(function* () {
    return yield* Effect.succeed(
      [...mockPlaylists].filter((e) => e !== undefined)
    );
  });

/** Gets the tracks in the specified playlist. */
const getPlaylistTracks = () =>
  Effect.gen(function* () {
    return yield* Effect.succeed([...mockTracks]);
  });

/** The (mock) service provider. */
const mockPlaylistServiceProvider = Effect.provideService(
  playlistServiceProgram,
  PlaylistService,
  { getRecentPlaylists, getPinnedPlaylists, getPlaylistTracks }
);

/** Hook to use the mock playlist service */
export function usePlaylistService() {
  return Effect.runSync(mockPlaylistServiceProvider);
}
