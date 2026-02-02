import { Console, Effect, Ref } from 'effect';
import {
  MusicLibraryService,
  MusicLibraryServiceError,
  Playlist,
  playlistServiceProgram,
  Track,
} from '@/backendApi/musicLibraryService';

export const mockPlaylists: Playlist[] = [
  {
    id: '0',
    name: 'Playlist 1',
    followers: [],
    tracks: [],
  },
  {
    id: '1',
    name: 'Playlist 2',
    followers: [],
    tracks: [],
  },
  {
    id: '2',
    name: 'Playlist 3',
    followers: [],
    tracks: [],
  },
  {
    id: '3',
    name: 'Playlist 4',
    followers: [],
    tracks: [],
  },
  {
    id: '4',
    name: 'Playlist 5',
    followers: [],
    tracks: [],
  },
  {
    id: '5',
    name: 'Playlist 6',
    followers: [],
    tracks: [],
  },
];

export const mockTracks: Track[] = [
  {
    id: '0',
    title: 'Track 0',
  },
  {
    id: '1',
    title: 'Track 1',
  },
  {
    id: '2',
    title: 'Track 2',
  },
  {
    id: '3',
    title: 'Track 3',
  },
  {
    id: '4',
    title: 'Track 4',
  },
  {
    id: '5',
    title: 'Track 5',
  },
  {
    id: '6',
    title: 'Track 6',
  },
  {
    id: '7',
    title: 'Track 7',
  },
  {
    id: '8',
    title: 'Track 8',
  },
];

export const mockPlaylistFollowers: { id: string; followers: string[] }[] = [
  {
    id: '0',
    followers: [],
  },
  {
    id: '1',
    followers: [],
  },
  {
    id: '2',
    followers: [],
  },
  {
    id: '3',
    followers: [],
  },
  {
    id: '4',
    followers: [],
  },
  {
    id: '5',
    followers: [],
  },
  {
    id: '6',
    followers: [],
  },
  {
    id: '7',
    followers: [],
  },
  {
    id: '8',
    followers: [],
  },
];

const createMusicLibraryState = () => {
  let state = {
    playlists: mockPlaylists,
    tracks: mockTracks,
  };
  const storedState = localStorage.getItem('music-lib-state');
  if (storedState) {
    state = JSON.parse(storedState);
  } else {
    localStorage.setItem('music-lib-state', JSON.stringify(state));
  }
  return Ref.make(state).pipe(Effect.runSync);
};

/** State of the music library. */
export const musicLibraryState = createMusicLibraryState();

/** Gets the specified playlist. */
const getPlaylist = (playlistId: string) =>
  Effect.gen(function* () {
    const musicLibrary = yield* musicLibraryState;
    const playlist = musicLibrary.playlists.find(
      (playlist) => playlist.id === playlistId
    );
    return playlist
      ? yield* Effect.succeed(playlist)
      : yield* Effect.fail(
          new MusicLibraryServiceError({
            message: `Playlist (id = ${playlistId}) not found`,
          })
        );
  });

/** Gets the specified track. */
const getTrack = (trackId: string) =>
  Effect.gen(function* () {
    const musicLibrary = yield* musicLibraryState;
    const track = musicLibrary.tracks.find((track) => track.id === trackId);
    return track
      ? yield* Effect.succeed(track)
      : yield* Effect.fail(
          new MusicLibraryServiceError({
            message: `Track (id = ${trackId}) not found`,
          })
        );
  });

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

/** Follows/un-follows the specified playlist.
 *
 * Returns `true` if the call resulted in the playlist being followed,
 * and `false` if it resulted in the playlist being unfollowed.
 * */
const toggleFollowPlaylist = (username: string, playlistId: string) =>
  Effect.gen(function* () {
    const playlist = yield* getPlaylist(playlistId);
    const isFollowing = playlist.followers.find((f) => f === username);

    // Unfollow if following
    const updatedMusicLibrary = {
      playlists: (yield* musicLibraryState).playlists.map((playlist) => {
        if (playlist.id === playlistId) {
          // Remove the specified username from the playlist's followers
          const newFollowers = playlist.followers.filter((f) => f !== username);
          playlist.followers = newFollowers;
        }
        return playlist;
      }),
      tracks: (yield* musicLibraryState).tracks,
    };
    if (isFollowing) {
      yield* Ref.set(musicLibraryState, updatedMusicLibrary);
      localStorage.setItem(
        'music-lib-state',
        JSON.stringify(updatedMusicLibrary)
      );
      return false;
    }

    // Follow if not already following
    else {
      const updatedMusicLibrary = {
        playlists: (yield* musicLibraryState).playlists.map((playlist) => {
          if (playlist.id === playlistId) {
            // Add specified username to playlist's followers
            playlist.followers.push(username);
          }
          return playlist;
        }),
        tracks: (yield* musicLibraryState).tracks,
      };
      yield* Ref.set(musicLibraryState, updatedMusicLibrary);
      localStorage.setItem(
        'music-lib-state',
        JSON.stringify(updatedMusicLibrary)
      );
      return true;
    }
  });

/** The (mock) service provider. */
const mockMusicLibraryServiceProvider = Effect.provideService(
  playlistServiceProgram,
  MusicLibraryService,
  {
    getPlaylist,
    getTrack,
    getRecentPlaylists,
    getPinnedPlaylists,
    toggleFollowPlaylist,
  }
);

/** Hook to use the mock playlist service */
export function useMusicLibraryService() {
  return Effect.runSync(mockMusicLibraryServiceProvider);
}
