import {
  MusicLibraryService,
  MusicLibraryServiceError,
  Playlist,
  Track,
} from '@/musicLibraryService/musicLibraryService';
import {
  PLAYLISTS_STORE_NAME,
  TRACKS_STORE_NAME,
  useDBProvider,
} from '@/dbService/mockDBServiceProvider';
import { createStore, produce } from 'solid-js/store';
import { errAsync, okAsync } from 'neverthrow';
import { v1 as uuidv1 } from 'uuid';
import { DBServiceError } from '@/dbService/dbService';

/** MusicLibrary store. */
const [musicStore, setMusicStore] = createStore<MusicLibraryService>({
  isReady: false,
  getPlaylist: () => errAsync(new MusicLibraryServiceError('Not implemented')),
  getTrack: () => errAsync(new MusicLibraryServiceError('Not implemented')),
  getRecentPlaylists: () =>
    errAsync(new MusicLibraryServiceError('Not implemented')),
  getPinnedPlaylists: () =>
    errAsync(new MusicLibraryServiceError('Not implemented')),
  toggleFollowPlaylist: () =>
    errAsync(new MusicLibraryServiceError('Not implemented')),
  createPlaylist: () =>
    errAsync(new MusicLibraryServiceError('Not implemented')),
  addTrack: () => errAsync(new MusicLibraryServiceError('Not implemented')),
  addTrackToPlaylist: () =>
    errAsync(new MusicLibraryServiceError('Not implemented')),
});

/** Initialize the DB. */
const db = useDBProvider();

/** Gets the specified playlist. */
function getPlaylist(playlistId: string) {
  setMusicStore('isReady', false);
  return db
    .getRecord<Playlist>(PLAYLISTS_STORE_NAME, playlistId)
    .andTee(() => setMusicStore('isReady', true))
    .orTee((e) => console.debug('DBError', e.message, e.info))
    .mapErr(
      () =>
        new MusicLibraryServiceError(
          `Invalid playlist: Playlist with id=${playlistId} doesn't exist`
        )
    );
}

/** Gets the specified track. */
function getTrack(trackId: string) {
  setMusicStore('isReady', false);
  return db
    .getRecord<Track>(TRACKS_STORE_NAME, trackId)
    .andTee(() => setMusicStore('isReady', true))
    .orTee((e) => console.debug('DBError', e.message, e.info))
    .mapErr(
      () =>
        new MusicLibraryServiceError(
          `Invalid track: Track with id=${trackId} doesn't exit`
        )
    );
}

/** Gets the (up to) 12 most recently played playlists. */
function getRecentPlaylists(userId: string) {
  setMusicStore('isReady', false);
  return db
    .getAllRecords<Playlist>(PLAYLISTS_STORE_NAME)
    .andThen((playlists) => {
      // Get all playlists created or followed by the user
      const userPlaylists = playlists.filter(
        (p) => p.createdBy === userId || p.followers.includes(userId)
      );

      // Sort all of the user's playlists by their last played times
      const sortedPlaylists = userPlaylists
        .sort((a, b) => {
          if (a.lastPlayed === b.lastPlayed) {
            return 0;
          } else if (a.lastPlayed < b.lastPlayed) {
            return -1;
          } else {
            return 1;
          }
        })
        .slice(0, 12);
      return okAsync(sortedPlaylists);
    })
    .andTee(() => setMusicStore('isReady', true))
    .orTee((e) => console.debug('DBError', e.message, e.info))
    .mapErr(
      () => new MusicLibraryServiceError('Failed to get recent playlists')
    );
}

/** Gets the (up to) 6 pinned playlists. */
function getPinnedPlaylists(userId: string) {
  setMusicStore('isReady', false);
  return db
    .getAllRecords<Playlist>(PLAYLISTS_STORE_NAME)
    .andThen((playlists) =>
      okAsync(playlists.filter((p) => p.pinned.includes(userId)).slice(0, 6))
    )
    .andTee(() => setMusicStore('isReady', true))
    .orTee((e) => console.debug('DBError', e.message, e.info))
    .mapErr(
      () => new MusicLibraryServiceError('Failed to get pinned playlists')
    );
}

/** Follows/un-follows the specified playlist.
 *
 * Returns `true` if the call resulted in the playlist being followed,
 * and `false` if it resulted in the playlist being unfollowed.
 * */
function toggleFollowPlaylist(userId: string, playlistId: string) {
  setMusicStore('isReady', false);
  return db
    .getRecord<Playlist>(PLAYLISTS_STORE_NAME, playlistId)
    .andThen((playlist) => {
      const isFollowing = !!playlist?.followers.find(
        (follower) => follower === userId
      );

      // Unfollow if following
      if (isFollowing) {
        db.putRecord<Partial<Playlist>>(
          PLAYLISTS_STORE_NAME,
          {
            ...playlist,
            followers: playlist?.followers.filter((id) => id !== userId),
          },
          playlistId
        ).andTee(() => setMusicStore('isReady', true));
        return okAsync({ following: false });
      }

      // Follow playlist if not already following
      playlist?.followers.push(userId);
      db.putRecord<Partial<Playlist>>(
        PLAYLISTS_STORE_NAME,
        { ...playlist, followers: playlist?.followers },
        playlistId
      ).andTee(() => setMusicStore('isReady', true));
      return okAsync({ following: true });
    })
    .orTee((e) => console.debug('DBError', e.message, e.info))
    .mapErr(
      () => new MusicLibraryServiceError('Failed to toggle playlist follow')
    );
}

/** Creates a new playlist. */
function createPlaylist(playlist: Omit<Playlist, 'id'>) {
  setMusicStore('isReady', false);
  const playlistId = uuidv1();
  return db
    .putRecord<Playlist>(PLAYLISTS_STORE_NAME, {
      id: playlistId,
      ...playlist,
    })
    .andThen(() => okAsync({ playlistId }))
    .andTee(() => setMusicStore('isReady', true))
    .orTee((e) => console.debug('DBError', e.message, e.info))
    .mapErr(() => new MusicLibraryServiceError('Unable to create playlist'));
}

/** Adds the track to the music library. */
function addTrack(track: Omit<Track, 'id'>) {
  setMusicStore('isReady', false);
  const trackId = uuidv1();
  return db
    .putRecord<Track>(TRACKS_STORE_NAME, {
      id: trackId,
      ...track,
    })
    .andThen(() => okAsync({ trackId }))
    .andTee(() => setMusicStore('isReady', true))
    .orTee((e) => console.debug('DBError', e.message, e.info))
    .mapErr(
      () => new MusicLibraryServiceError('Unable to add track to library')
    );
}

/** Adds the track to the specified playlist. */
function addTrackToPlaylist(trackId: string, playlistId: string) {
  return db
    .getRecord<Playlist>(PLAYLISTS_STORE_NAME, playlistId)
    .andThen((playlist) => {
      if (!playlist) {
        return errAsync(
          new MusicLibraryServiceError('Playlist does not exist')
        );
      }

      // Update tracks
      playlist.tracks.push(trackId);
      db.putRecord<Playlist>(
        PLAYLISTS_STORE_NAME,
        {
          ...playlist,
          tracks: playlist.tracks,
        },
        playlistId
      ).andTee(() => setMusicStore('isReady', true));

      return okAsync();
    })
    .orTee((e) =>
      e instanceof DBServiceError
        ? console.debug('DBError', e.message, e.info)
        : null
    )
    .mapErr((e) =>
      e instanceof DBServiceError
        ? new MusicLibraryServiceError('Unable to add track playlist')
        : e
    );
}

/** Update store with actual imlementations. */
setMusicStore(
  produce((store) => {
    store.getPlaylist = getPlaylist;
    store.getTrack = getTrack;
    store.getRecentPlaylists = getRecentPlaylists;
    store.getPinnedPlaylists = getPinnedPlaylists;
    store.toggleFollowPlaylist = toggleFollowPlaylist;
    store.createPlaylist = createPlaylist;
    store.addTrack = addTrack;
    store.addTrackToPlaylist = addTrackToPlaylist;
  })
);

/** Returns the auth provider. */
export function useMusicLibraryService(): MusicLibraryService {
  return musicStore;
}
