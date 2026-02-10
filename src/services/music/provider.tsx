import {
  DBService,
  PlaylistRecord,
  TrackRecord,
} from '@/services/database/service';
import {
  PLAYLISTS_STORE_NAME,
  TRACKS_STORE_NAME,
  useIndexDB,
} from '@/services/database/indexDBProvider';
import { AuthService } from '@/services/auth/service';
import {
  MusicLibraryError,
  MusicLibraryService,
  MusicLibraryState,
  PlaylistID,
  TrackID,
} from '@/services/music/service';
import { createStore } from 'solid-js/store/types/server.js';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import { useAuth } from '@/services/auth/provider';
import { useLogger } from '@/services/logger/provider';

// TODO: Stream music instead of directly downloading?
//  - Tauri events from the backend to signal when track/playlist is ready
//
//  TODO: Update database state in background

/** Loads the music library from the database. */
async function loadMusicLibrary<DB>(db: DBService<DB>, auth: AuthService) {
  const logger = useLogger();
  if (!db.state.isReady || !auth.state.isReady || auth.state.user === null) {
    return null;
  }
  const user = auth.state.user;
  logger.info('Loading music library');

  // Get tracks from DB
  const extractTracks: Promise<{
    allTracks: TrackRecord[];
    currentTrack: TrackID | undefined;
  }> = db
    .readAllRecords<TrackRecord>(TRACKS_STORE_NAME)
    .andThen((tracks) => {
      const allTracks = tracks;
      const currentTrack = tracks.find((t) => t.isCurrent === true)?.id;
      return okAsync({
        allTracks,
        currentTrack: currentTrack ? { trackId: currentTrack } : undefined,
      });
    })
    .match(
      (data) => {
        logger.info('Tracks loaded');
        return data;
      },
      (err) => {
        logger.error('Unable to load tracks', err.kind, err.message, err.info);
        return { allTracks: [], currentTrack: undefined };
      }
    );

  // Get playlists from DB
  const extractPlaylists: Promise<{
    allPlaylists: PlaylistRecord[];
    currentPlaylist: PlaylistID | undefined;
  }> = db
    .readAllRecords<PlaylistRecord>(PLAYLISTS_STORE_NAME)
    .andThen((playlists) => {
      // Get only current/downloaded/pinned playlists
      const allPlaylists = playlists.filter(
        (p) =>
          p.pinned.includes(user.id) ||
          p.download.includes(user.id) ||
          p.isCurrent
      );
      const currentPlaylistID = playlists.find((p) => p.isCurrent === true)?.id;
      return okAsync({
        allPlaylists,
        currentPlaylist: currentPlaylistID
          ? { playlistId: currentPlaylistID }
          : undefined,
      });
    })
    .match(
      (data) => {
        logger.info('Playlists loaded');
        return data;
      },
      (err) => {
        logger.error(
          'Unable to load playlists',
          err.kind,
          err.message,
          err.info
        );
        return {
          allPlaylists: [],
          currentPlaylist: undefined,
        };
      }
    );

  // Run all promises and extract music library data
  const extractedData = await Promise.all([extractTracks, extractPlaylists]);
  return {
    tracks: extractedData[0].allTracks,
    playlists: extractedData[1].allPlaylists,
    currentTrack: extractedData[0].currentTrack,
    currentPlaylist: extractedData[1].currentPlaylist,
  };
}

/** Initalizes the music library service provider. */
async function initMusicLibraryProvider(): Promise<MusicLibraryService> {
  const db = useIndexDB();
  const auth = useAuth();

  // Load music library and initalize state
  const musicLib = await loadMusicLibrary(db, auth);
  const [state, setState] = createStore<MusicLibraryState>({
    isReady: true,
    library: {
      tracks: musicLib?.tracks ?? [],
      playlists: musicLib?.playlists ?? [],
    },
    currentPlaylist: musicLib?.currentPlaylist,
    currentTrack: musicLib?.currentTrack,
  });

  /** Adds a new track to the library. */
  function addTrack(track: TrackRecord): ResultAsync<void, MusicLibraryError> {
    setState('isReady', false);
    return db
      .createRecord<TrackRecord>(TRACKS_STORE_NAME, track)
      .andTee(() => setState('isReady', true))
      .mapErr((error) => ({
        kind: 'Add Track Failed',
        message: 'Unable to add the track to the library',
        info: { track, error },
      }));
  }

  /** Gets the specified track from the library. */
  function getTrack(
    trackId: TrackID
  ): ResultAsync<TrackRecord | null, MusicLibraryError> {
    setState('isReady', false);
    return db
      .readRecord<TrackRecord, string>(TRACKS_STORE_NAME, trackId.trackId)
      .andTee(() => setState('isReady', true))
      .mapErr((error) => ({
        kind: 'Get Track Failed',
        message: 'Unable to get the track from the library',
        info: { trackId, error },
      }));
  }

  /** Updates the specified track to the new value. */
  function updateTrack(
    trackId: TrackID,
    value: TrackRecord
  ): ResultAsync<void, MusicLibraryError> {
    setState('isReady', false);
    return db
      .updateRecord<TrackRecord, string>(
        TRACKS_STORE_NAME,
        trackId.trackId,
        value
      )
      .andTee(() => setState('isReady', true))
      .mapErr((error) => ({
        kind: 'Update Track Failed',
        message: 'Unable to update the track',
        info: { trackId, value, error },
      }));
  }

  /** Removes the specified track from the library.
   *
   * # Note
   * The deleted track is returned if the delete was successful.
   * */
  function removeTrack(
    trackId: TrackID
  ): ResultAsync<TrackRecord, MusicLibraryError> {
    setState('isReady', false);
    return db
      .deleteRecord<TrackRecord, string>(TRACKS_STORE_NAME, trackId.trackId)
      .andTee(() => setState('isReady', true))
      .mapErr((error) => ({
        kind: 'Remove Track Failed',
        message: 'Unable to remove the track from the music library',
        info: { trackId, error },
      }));
  }

  /** Adds the given tracks to the specified playlist. */
  function addTracksToPlaylist(
    trackIds: TrackID | TrackID[],
    playlistId: PlaylistID
  ): ResultAsync<void, MusicLibraryError> {
    setState('isReady', false);
    return db
      .readRecord<
        PlaylistRecord,
        string
      >(PLAYLISTS_STORE_NAME, playlistId.playlistId)
      .andThen((playlist) => {
        if (!playlist) {
          return errAsync({
            kind: 'Invalid Playlist',
            message: 'Unable to find playlist with the given ID',
            info: { table: PLAYLISTS_STORE_NAME, playlistId },
          });
        }

        // Update playlist tracks
        Array.isArray(trackIds)
          ? trackIds
              .map((id) => id.trackId)
              .forEach((id) => playlist.tracks.push(id))
          : playlist.tracks.push(trackIds.trackId);

        // Update database
        return db
          .updateRecord<PlaylistRecord, string>(
            PLAYLISTS_STORE_NAME,
            playlistId.playlistId,
            playlist
          )
          .andTee(() => setState('isReady', true))
          .mapErr((error) => ({
            kind: 'Playlist Update Failed',
            message: 'Unable to add the track(s) to the playlist',
            info: { trackIds, playlistId, table: PLAYLISTS_STORE_NAME, error },
          }));
      });
  }

  /** Removes the given tracks from the specified playlist. */
  function removeTracksFromPlaylist(
    trackIds: TrackID | TrackID[],
    playlistId: PlaylistID
  ): ResultAsync<TrackRecord[], MusicLibraryError> {
    setState('isReady', false);
    return db
      .readRecord<
        PlaylistRecord,
        string
      >(PLAYLISTS_STORE_NAME, playlistId.playlistId)
      .andThen((playlist) => {
        if (!playlist) {
          return errAsync({
            kind: 'Invalid Playlist',
            message: 'Unable to find playlist with the given ID',
            info: { table: PLAYLISTS_STORE_NAME, playlistId },
          });
        }

        // Remove tracks from playlist
        const newPlaylistTracks = playlist.tracks.filter((trackId) => {
          return Array.isArray(trackIds)
            ? !trackIds.includes({ trackId })
            : trackId !== trackIds.trackId;
        });

        // Get removed tracks
        const removedTracks = Array.isArray(trackIds)
          ? ResultAsync.combine(trackIds.map(getTrack)).map((tracks) =>
              tracks.filter((track) => track !== null)
            )
          : getTrack(trackIds).map((track) => (track ? [track] : []));

        // Update the database
        return db
          .updateRecord<PlaylistRecord, string>(
            PLAYLISTS_STORE_NAME,
            playlistId.playlistId,
            { ...playlist, tracks: newPlaylistTracks }
          )
          .andThen(() => removedTracks)
          .andTee(() => setState('isReady', true));
      });
  }

  return {
    state,
    addTrack,
    getTrack,
    updateTrack,
    removeTrack,
    addTracksToPlaylist,
    removeTracksFromPlaylist,
    addPlaylist: () => errAsync({ message: 'Not Implemented!' }),
    getPlaylist: () => errAsync({ message: 'Not Implemented!' }),
    updatePlaylist: () => errAsync({ message: 'Not Implemented!' }),
    removePlaylist: () => errAsync({ message: 'Not Implemented!' }),
    followPlaylist: () => errAsync({ message: 'Not Implemented!' }),
    unfollowPlaylist: () => errAsync({ message: 'Not Implemented!' }),
    pinPlaylist: () => errAsync({ message: 'Not Implemented!' }),
    unpinPlaylist: () => errAsync({ message: 'Not Implemented!' }),
    getAllTracks: () => errAsync({ message: 'Not Implemented!' }),
    getAllPlaylists: () => errAsync({ message: 'Not Implemented!' }),
  };
}
