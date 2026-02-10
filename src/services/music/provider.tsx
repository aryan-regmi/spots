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
  UserID,
} from '@/services/music/service';
import { createStore } from 'solid-js/store/types/server.js';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import { useAuth } from '@/services/auth/provider';
import { useLogger } from '@/services/logger/provider';
import { produce } from 'solid-js/store';

// TODO: Stream music instead of directly downloading?
//  - Tauri events from the backend to signal when track/playlist is ready
//
//  TODO: Update database state in background
//    - Service will directly update the state
//    - Run effects or something asynchronously to sync DB with state

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

// FIXME: Keep state in sync!!

// FIXME: Make providers classes?

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
    return (
      db
        // Create new record in DB
        .createRecord<TrackRecord>(TRACKS_STORE_NAME, track)

        // Add track to state
        .andTee(() => {
          let newTracks = state.library.tracks;
          newTracks.push(track);
          setState(
            produce((state) => {
              state.library.tracks = newTracks;
              state.isReady = true;
            })
          );
        })

        // Handle returns
        .mapErr((error) => ({
          kind: 'Add Track Failed',
          message: 'Unable to add the track to the library',
          info: { track, error },
        }))
    );
  }

  /** Gets the specified track from the library. */
  function getTrack(
    trackId: TrackID
  ): ResultAsync<TrackRecord | null, MusicLibraryError> {
    setState('isReady', false);

    // Check if the state already has the requested track
    const foundTrack = state.library.tracks.find(
      (t) => t.id === trackId.trackId
    );

    // Return value from state if it exists
    if (foundTrack) {
      return okAsync(foundTrack);
    }

    // Get track from DB if not in state
    return db
      .readRecord<TrackRecord, string>(TRACKS_STORE_NAME, trackId.trackId)
      .andTee((record) => {
        // Add track to the state
        if (record) {
          let newTracks = state.library.tracks;
          newTracks.push(record);
          setState(
            produce((state) => {
              state.library.tracks = newTracks;
            })
          );
        }
        setState('isReady', true);
      })
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

    return (
      db
        // Update DB
        .updateRecord<TrackRecord, string>(
          TRACKS_STORE_NAME,
          trackId.trackId,
          value
        )

        // Update state
        .andTee(() => {
          const trackIdx = state.library.tracks.findIndex(
            (track) => track.id === trackId.trackId
          );

          // Track exists in state, just update it
          if (trackIdx !== -1) {
            setState(
              produce((state) => {
                state.library.tracks[trackIdx] = value;
                state.isReady = true;
              })
            );
            return;
          }

          // Track doesnt exist in state => add new track
          {
            let newTracks = state.library.tracks;
            newTracks.push(value);
            setState(
              produce((state) => {
                state.library.tracks = newTracks;
                state.isReady = true;
              })
            );
          }
        })

        // Handle errors
        .mapErr((error) => ({
          kind: 'Update Track Failed',
          message: 'Unable to update the track',
          info: { trackId, value, error },
        }))
    );
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
    return (
      db
        // Delete the track from the DB
        .deleteRecord<TrackRecord, string>(TRACKS_STORE_NAME, trackId.trackId)

        // TODO: Remove from all playlists in the database

        // Delete from state
        .andTee(() => {
          // Update tracks list
          const newTracks = state.library.tracks.filter(
            (track) => track.id !== trackId.trackId
          );

          // Update playlists containing the track
          const updated = state.library.playlists.map((playlist) => {
            if (playlist.tracks.includes(trackId.trackId)) {
              playlist.tracks = playlist.tracks.filter(
                (track) => track !== trackId.trackId
              );
            }
            return playlist;
          });

          setState(
            produce((state) => {
              state.library.tracks = newTracks;
              state.library.playlists = updated;
              state.isReady = true;
            })
          );
        })

        // Handle errors
        .mapErr((error) => ({
          kind: 'Remove Track Failed',
          message: 'Unable to remove the track from the music library',
          info: { trackId, error },
        }))
    );
  }

  /** Adds the given tracks to the specified playlist. */
  function addTracksToPlaylist(
    trackIds: TrackID | TrackID[],
    playlistId: PlaylistID
  ): ResultAsync<void, MusicLibraryError> {
    setState('isReady', false);

    // Determines if the playlist was found in the state
    let isPlaylistFromDb = false;

    // Gets the playlist from the state
    const getPlaylistFromState = () => {
      return okAsync(
        state.library.playlists.find((p) => p.id === playlistId.playlistId)
      ).andTee((p) =>
        p ? (isPlaylistFromDb = false) : (isPlaylistFromDb = true)
      );
    };

    // Gets the playlist from the DB
    const getPlaylistFromDB = (foundPlaylist: PlaylistRecord | undefined) =>
      foundPlaylist
        ? okAsync(foundPlaylist)
        : db
            .readRecord<PlaylistRecord>(
              PLAYLISTS_STORE_NAME,
              playlistId.playlistId
            )
            .andThen((playlist) =>
              playlist
                ? okAsync(playlist)
                : errAsync({
                    kind: 'Invalid Playlist',
                    message: 'Unable to find playlist with the given ID',
                    info: { table: PLAYLISTS_STORE_NAME, playlistId },
                  } as MusicLibraryError)
            );

    // Adds the tracks to the playlist
    const addTracks = (playlist: PlaylistRecord) =>
      Array.isArray(trackIds)
        ? trackIds
            .map((id) => id.trackId)
            .forEach((id) => playlist.tracks.push(id))
        : playlist.tracks.push(trackIds.trackId);

    // Updates the playlist in the DB
    const updateDatabase = (playlist: PlaylistRecord) => {
      return db
        .updateRecord<
          PlaylistRecord,
          string
        >(PLAYLISTS_STORE_NAME, playlistId.playlistId, playlist)
        .andThen(() => okAsync(playlist));
    };

    // Updates the playlist in the state
    const updateState = (playlist: PlaylistRecord) => {
      // Playlist exists in state -> update it
      if (!isPlaylistFromDb) {
        let newPlaylists = state.library.playlists.map((statePlaylist) => {
          if (statePlaylist.id === playlist.id) {
            statePlaylist = playlist;
          }
          return statePlaylist;
        });
        setState(
          produce((state) => {
            state.library.playlists = newPlaylists;
            state.isReady = true;
          })
        );
        return okAsync();
      }

      // Need to add playlist to the state
      let newPlaylists = state.library.playlists;
      newPlaylists.push(playlist);
      setState(
        produce((state) => {
          state.library.playlists = newPlaylists;
          state.isReady = true;
        })
      );
      return okAsync();
    };

    return getPlaylistFromState()
      .andThen(getPlaylistFromDB)
      .andTee((p) => addTracks(p))
      .andThen(updateDatabase)
      .andThen(updateState)
      .mapErr((error) => ({
        kind: 'Playlist Update Failed',
        message: 'Unable to add the track(s) to the playlist',
        info: { trackIds, playlistId, table: PLAYLISTS_STORE_NAME, error },
      }));
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

  /** Adds a new playlist to the library. */
  function addPlaylist(
    playlist: PlaylistRecord
  ): ResultAsync<void, MusicLibraryError> {
    setState('isReady', false);
    return db
      .createRecord<PlaylistRecord>(PLAYLISTS_STORE_NAME, playlist)
      .andTee(() => setState('isReady', true))
      .mapErr((error) => ({
        kind: 'Failed Adding Playlist',
        message: 'Unable to add playlist to the music library',
        info: { table: PLAYLISTS_STORE_NAME, playlist, error },
      }));
  }

  /** Gets the specified playlist from the library. */
  function getPlaylist(
    playlistId: PlaylistID
  ): ResultAsync<PlaylistRecord | null, MusicLibraryError> {
    setState('isReady', false);
    return db
      .readRecord<PlaylistRecord, string>(
        PLAYLISTS_STORE_NAME,
        playlistId.playlistId
      )
      .andTee(() => setState('isReady', true))
      .mapErr((error) => ({
        kind: 'Failed Getting Playlist',
        message: 'Unable to get playlist from the music library',
        info: { table: PLAYLISTS_STORE_NAME, playlistId, error },
      }));
  }

  /** Updates the specified playlist to the new value. */
  function updatePlaylist(
    playlistId: PlaylistID,
    value: PlaylistRecord
  ): ResultAsync<void, MusicLibraryError> {
    setState('isReady', false);
    return db
      .updateRecord<PlaylistRecord, string>(
        PLAYLISTS_STORE_NAME,
        playlistId.playlistId,
        value
      )
      .andTee(() => setState('isReady', true))
      .mapErr((error) => ({
        kind: 'Failed Updating Playlist',
        message: 'Unable to update playlist',
        info: { PLAYLISTS_STORE_NAME, playlistId, value, error },
      }));
  }

  /** Removes the specified playlist from the library.
   *
   * # Note
   * The deleted playlist is returned if the delete was successful.
   * */
  function removePlaylist(
    playlistId: PlaylistID
  ): ResultAsync<PlaylistRecord, MusicLibraryError> {
    setState('isReady', false);
    return db
      .deleteRecord<PlaylistRecord>(PLAYLISTS_STORE_NAME, playlistId.playlistId)
      .andTee(() => setState('isReady', true))
      .mapErr((error) => ({
        kind: 'Failed Removing Playlist',
        message: 'Unable to remove playlist form the music library',
        info: { PLAYLISTS_STORE_NAME, playlistId, error },
      }));
  }

  /** Make the specified user follow the playlist. */
  function followPlaylist(
    userId: UserID,
    playlistId: PlaylistID
  ): ResultAsync<void, MusicLibraryError> {
    setState('isReady', false);
    if (userId.kind !== 'name') {
      return errAsync({
        kind: 'Invalid User ID',
        message: 'The user ID must be of type `name`',
        info: { userId },
      });
    }

    return db
      .readRecord<PlaylistRecord>(PLAYLISTS_STORE_NAME, playlistId.playlistId)
      .andThen((playlist) => {
        if (!playlist) {
          return errAsync({
            kind: 'Invalid Playlist',
            message: 'Unable to find playlist with the given ID',
            info: { table: PLAYLISTS_STORE_NAME, playlistId },
          });
        }

        // Update playlist's followers
        if (!playlist.followers.includes(userId.name)) {
          playlist.followers.push(userId.name);
        }

        // Update the database
        return db.updateRecord<PlaylistRecord>(
          PLAYLISTS_STORE_NAME,
          playlistId.playlistId,
          { ...playlist }
        );
      })
      .andTee(() => setState('isReady', true))
      .mapErr((error) => ({
        kind: 'Failed Following Playlist',
        message: 'Unable to follow playlist',
        info: { PLAYLISTS_STORE_NAME, userId, playlistId, error },
      }));
  }

  /** Make the specified user un-follow the playlist. */
  function unfollowPlaylist(
    userId: UserID,
    playlistId: PlaylistID
  ): ResultAsync<void, MusicLibraryError> {
    setState('isReady', false);
    if (userId.kind !== 'name') {
      return errAsync({
        kind: 'Invalid User ID',
        message: 'The user ID must be of type `name`',
        info: { userId },
      });
    }

    return db
      .readRecord<PlaylistRecord>(PLAYLISTS_STORE_NAME, playlistId.playlistId)
      .andThen((playlist) => {
        if (!playlist) {
          return errAsync({
            kind: 'Invalid Playlist',
            message: 'Unable to find playlist with the given ID',
            info: { table: PLAYLISTS_STORE_NAME, playlistId },
          });
        }

        // Remove from the playlist's followers
        const newFollowers = playlist.followers.filter(
          (followerId) => followerId !== userId.name
        );

        // Update the database
        return db.updateRecord<PlaylistRecord>(
          PLAYLISTS_STORE_NAME,
          playlistId.playlistId,
          { ...playlist, followers: newFollowers }
        );
      })
      .andTee(() => setState('isReady', true))
      .mapErr((error) => ({
        kind: 'Failed Following Playlist',
        message: 'Unable to follow playlist',
        info: { PLAYLISTS_STORE_NAME, userId, playlistId, error },
      }));
  }

  return {
    state,
    addTrack,
    getTrack,
    updateTrack,
    removeTrack,
    addTracksToPlaylist,
    removeTracksFromPlaylist,
    addPlaylist,
    getPlaylist,
    updatePlaylist,
    removePlaylist,
    followPlaylist,
    unfollowPlaylist,
    pinPlaylist: () => errAsync({ message: 'Not Implemented!' }),
    unpinPlaylist: () => errAsync({ message: 'Not Implemented!' }),
    getAllTracks: () => errAsync({ message: 'Not Implemented!' }),
    getAllPlaylists: () => errAsync({ message: 'Not Implemented!' }),
  };
}

class MusicLibraryServiceProvider implements MusicLibraryService {
  constructor() {
    this.state = {
      isReady: true,
      library: { playlists: [], tracks: [] },
      currentTrack: undefined,
      currentPlaylist: undefined,
    };

    if (
      !this.db.state.isReady ||
      !this.auth.state.isReady ||
      this.auth.state.user === null
    ) {
      return;
    }

    // TODO: Finish!

    // Load tracks from the database
  }

  private logger = useLogger();
  private db = useIndexDB();
  private auth = useAuth();

  public state: MusicLibraryState;

  public addTrack(track: TrackRecord) {
    return errAsync({ message: 'TODO' });
  }

  public getTrack(trackId: TrackID) {
    return errAsync({ message: 'TODO' });
  }

  public updateTrack(trackId: TrackID, value: TrackRecord) {
    return errAsync({ message: 'TODO' });
  }

  removeTrack(trackId: TrackID) {
    return errAsync({ message: 'TODO' });
  }

  addTracksToPlaylist(trackIds: TrackID | TrackID[], playlistId: PlaylistID) {
    return errAsync({ message: 'TODO' });
  }

  removeTracksFromPlaylist(
    trackIds: TrackID | TrackID[],
    playlistId: PlaylistID
  ) {
    return errAsync({ message: 'TODO' });
  }

  addPlaylist: (
    playlist: PlaylistRecord
  ) => ResultAsync<void, MusicLibraryError>;

  getPlaylist: (
    playlistId: PlaylistID
  ) => ResultAsync<PlaylistRecord | null, MusicLibraryError>;

  updatePlaylist: (
    playlistId: PlaylistID,
    value: PlaylistRecord
  ) => ResultAsync<void, MusicLibraryError>;

  removePlaylist: (
    playlistId: PlaylistID
  ) => ResultAsync<PlaylistRecord, MusicLibraryError>;

  followPlaylist: (
    userId: UserID,
    playlistId: PlaylistID
  ) => ResultAsync<void, MusicLibraryError>;

  unfollowPlaylist: (
    userId: UserID,
    playlistId: PlaylistID
  ) => ResultAsync<void, MusicLibraryError>;

  pinPlaylist: (
    userId: UserID,
    playlistId: PlaylistID
  ) => ResultAsync<void, MusicLibraryError>;

  unpinPlaylist: (
    userId: UserID,
    playlistId: PlaylistID
  ) => ResultAsync<void, MusicLibraryError>;

  getAllTracks: (
    userId: UserID
  ) => ResultAsync<TrackRecord[], MusicLibraryError>;

  getAllPlaylists: (
    userId: UserID
  ) => ResultAsync<PlaylistRecord[], MusicLibraryError>;
}
