import { Effect, Ref } from 'effect';
import {
  MusicLibraryService,
  MusicLibraryServiceError,
  Playlist,
  Track,
  playlistServiceProgram,
} from '@/backendApi/musicLibraryService';
import { ICommonTagsResult, parseBlob } from 'music-metadata';
import { JSX } from 'solid-js';
import { base64String } from 'effect/FastCheck';

const MUSIC_LIB_STATE_KEY = 'music-lib-state';

/** Initalizes the music library. */
const createMusicLibraryState = () => {
  let state: { playlists: Playlist[]; tracks: Track[] } = {
    playlists: [],
    tracks: [],
  };
  const storedState = localStorage.getItem(MUSIC_LIB_STATE_KEY);
  if (storedState) {
    state = JSON.parse(storedState);
  } else {
    localStorage.setItem('music-lib-state', JSON.stringify(state));
  }
  return Ref.make(state).pipe(Effect.runSync);
};

/** State of the music library. */
const musicLibraryState = createMusicLibraryState();

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
      const playlistName =
        playlist.name || `Playlist #${musicLibrary.playlists.length}`;
      if (
        playlist.name === 'All Tracks' &&
        playlist.createdBy === '__SYSTEM__'
      ) {
        playlistId = '0';
      } else {
        playlistId = `${playlistName}-${playlist.createdBy}`.replace(/\s/g, '');
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

      // Update localStorage
      localStorage.setItem(
        MUSIC_LIB_STATE_KEY,
        JSON.stringify(updatedMusicLibrary)
      );

      return yield* Effect.succeed(playlistId);
    } else {
      return yield* Effect.fail(
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
      const trackId =
        `${trackTitle}-${Effect.runSync(musicLibraryState.get).tracks.length}`.replace(
          /\s/g,
          ''
        );
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

      // Update localStorage
      localStorage.setItem(
        MUSIC_LIB_STATE_KEY,
        JSON.stringify(updatedMusicLibrary)
      );

      return yield* Effect.succeed(trackId);
    } else {
      return yield* Effect.fail(
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

      // Update localStorage
      localStorage.setItem(
        MUSIC_LIB_STATE_KEY,
        JSON.stringify(updatedMusicLibrary)
      );
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

/** Info for `All Tracks` playlist created by default. */
export const ALL_TRACKS = {
  id: '0',
  name: 'All Tracks',
  createdBy: '__SYSTEM__',
};

/** Returns an handler that adds selected files to the music library.
 *
 * # Note
 * This must be attached to an <input type="file" /> element.
 * */
export function TrackImporter() {
  const musicLibService = useMusicLibraryService();

  /** Parses the given file as an audio file. */
  const parseAudioFile = (file: File) =>
    Effect.tryPromise({
      try: () => parseBlob(file),
      catch: (e) => console.error(e),
    });

  /** Extracts the track image from the audio blob.*/
  const extractTrackImg = (audioBlob: ICommonTagsResult) =>
    Effect.gen(function* () {
      if (audioBlob.picture && audioBlob.picture.length > 0) {
        const picture = audioBlob.picture[0];
        const base64String = btoa(
          String.fromCharCode(...new Uint8Array(picture.data))
        );
        const imgSrc = `data:${picture.format};base64,${base64String}`;
        return imgSrc;
      }
    });

  /** Adds the selected files to the music library. */
  const addTracksToMusicLibrary: JSX.EventHandler<HTMLInputElement, Event> = (
    e
  ) => {
    const program = Effect.gen(function* () {
      const event = e.target as HTMLInputElement;
      const files = Array.from(event.files || []);

      files.forEach((file) =>
        Effect.gen(function* () {
          // Add track to library
          const audioBlob = yield* parseAudioFile(file);
          const imgSrc = yield* extractTrackImg(audioBlob.common);
          const fileBuffer = yield* Effect.tryPromise({
            try: () => file.arrayBuffer(),
            catch: console.error,
          });
          const trackSrc = arrayBufferToBase64(fileBuffer);
          const trackID = yield* musicLibService.addTrack({
            src: trackSrc,
            imgSrc,
            title: audioBlob.common.title || file.name,
            artist: audioBlob.common.artist,
            album: audioBlob.common.album,
          });

          // Add track to `All Songs` playlist
          yield* musicLibService.addTrackToPlaylist(trackID, ALL_TRACKS.id);
        }).pipe(Effect.runFork)
      );
    });
    Effect.runFork(program);
  };

  return {
    parseAudioFile,
    extractTrackImg,
    addTracksToMusicLibrary,
  };
}
