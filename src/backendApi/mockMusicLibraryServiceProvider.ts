import { Effect, Ref } from 'effect';
import {
  MusicLibraryService,
  MusicLibraryServiceError,
  Playlist,
  Track,
  playlistServiceProgram,
} from '@/backendApi/musicLibraryService';

/** Initalizes the music library. */
const createMusicLibraryState = () => {
  let state: { playlists: Playlist[]; tracks: Track[] } = {
    playlists: [],
    tracks: [],
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
    return yield* Effect.succeed([]);
  });

/** Gets the (up to) 6 pinned playlists. */
const getPinnedPlaylists = () =>
  Effect.gen(function* () {
    return yield* Effect.succeed([]);
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

/** Creates a new playlist. */
const createPlaylist = (playlist: Partial<Playlist>) =>
  Effect.gen(function* () {
    const musicLibrary = yield* musicLibraryState;
    const playlistExists = !!musicLibrary.playlists.find(
      (p) => p.name === playlist.name && p.createdBy === playlist.createdBy
    );

    // Update state to add new playlist
    if (!playlistExists) {
      // Handles `All Tracks` playlist creation
      let playlistId = '';
      if (
        playlist.name === 'All Tracks' &&
        playlist.createdBy === '__SYSTEM__'
      ) {
        playlistId = '0';
      } else {
        const playlistName =
          playlist.name || `Playlist #${musicLibrary.playlists.length}`;
        playlistId = `${playlistName}-${playlist.createdBy}`;
      }

      // Create new playlist array with the new playlist
      let updatedPlaylistArray = musicLibrary.playlists;
      updatedPlaylistArray.push({
        id: playlistId,
        name: playlistName,
        imgSrc: playlist.imgSrc,
        createdBy: playlist.createdBy || 'Unknown',
        tracks: playlist.tracks || [],
        followers: playlist.followers || [],
      });

      // Update the music library to use the new playlist array
      const updatedMusicLibrary = {
        playlists: updatedPlaylistArray,
        tracks: musicLibrary.tracks,
      };
      yield* Ref.set(musicLibraryState, updatedMusicLibrary);
    } else {
      yield* Effect.fail(
        new MusicLibraryServiceError({
          message: 'Playlist already exists',
        })
      );
    }
  });

/** Adds the track to the music library. */
const addTrack = (track: Partial<Track>) =>
  Effect.gen(function* () {
    const musicLibrary = yield* musicLibraryState;
    const trackExists = !!musicLibrary.tracks.find(
      (t) => t.src === track.src && t.title === track.title
    );

    // Update state to add new track
    if (!trackExists) {
      if (!track.src) {
        yield* Effect.fail(
          new MusicLibraryServiceError({
            message: 'Track must have a source',
          })
        );
      }

      // Create new track array with the new track
      const trackTitle = track.title || `Track #${musicLibrary.tracks.length}`;
      const trackId = track.title || trackTitle;
      let updatedTrackArray = musicLibrary.tracks;
      updatedTrackArray.push({
        id: trackId,
        src: track.src!,
        imgSrc: track.imgSrc,
        title: track.title,
        artist: track.artist,
        album: track.album,
      });

      // Update the music library to use the new playlist array
      const updatedMusicLibrary = {
        playlists: musicLibrary.playlists,
        tracks: updatedTrackArray,
      };
      yield* Ref.set(musicLibraryState, updatedMusicLibrary);
    } else {
      yield* Effect.fail(
        new MusicLibraryServiceError({
          message: 'Track already exists in library',
        })
      );
    }
  });

/** Adds the track to the specified playlist. */
const addTrackToPlaylist = (trackId: string, playlistId: string) =>
  Effect.gen(function* () {
    const musicLibrary = yield* musicLibraryState;
    const playlist = yield* getPlaylist(playlistId);
    const trackInPlaylist = !!playlist.tracks.find((tid) => tid === trackId);

    // Update state to add track to playlist
    if (!trackInPlaylist) {
      // Create new `tracks` array with the track to add
      let updatedPlaylistArray = musicLibrary.playlists;
      updatedPlaylistArray.map((p) => {
        if (p.id === playlistId) {
          p.tracks.push(trackId);
        }
      });

      // Update the music library to use the new playlist array
      const updatedMusicLibrary = {
        playlists: updatedPlaylistArray,
        tracks: musicLibrary.tracks,
      };
      yield* Ref.set(musicLibraryState, updatedMusicLibrary);
    } else {
      yield* Effect.fail(
        new MusicLibraryServiceError({
          message: 'Track is already in playlist',
        })
      );
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
    createPlaylist,
    addTrack,
    addTrackToPlaylist,
  }
);

/** Hook to use the mock playlist service */
export function useMusicLibraryService() {
  return Effect.runSync(mockMusicLibraryServiceProvider);
}
