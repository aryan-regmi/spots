import {
  USERS_STORE_NAME,
  PLAYLISTS_STORE_NAME,
  TRACKS_STORE_NAME,
} from './mockDBServiceProvider';
import { v1 as uuidV1 } from 'uuid';

export const migrations = [{ version: 1, run: migrationV1 }];

/** Version 1 migration. */
function migrationV1(dbConn: IDBDatabase, event: IDBVersionChangeEvent) {
  const request = event.target as IDBOpenDBRequest;
  dbConn = request.result;

  // Initalize `userStore`
  const userStore = dbConn.createObjectStore(USERS_STORE_NAME, {
    keyPath: 'username',
  });
  userStore.createIndex('username', 'username', { unique: true });
  userStore.createIndex('password', 'password', { unique: false });
  userStore.createIndex('isAuth', 'isAuth', { unique: true });
  userStore.createIndex('id', 'id', { unique: true });
  userStore.transaction.oncomplete = () => {
    // Add dev user
    const store = dbConn
      .transaction(USERS_STORE_NAME, 'readwrite')
      .objectStore(USERS_STORE_NAME);
    store.put({
      username: 'dev',
      password: 'dev',
      isAuth: false,
      id: uuidV1(),
    });
  };

  // Initalize `playlistsStore`
  const playlistsStore = dbConn.createObjectStore(PLAYLISTS_STORE_NAME, {
    keyPath: 'id',
  });
  playlistsStore.createIndex('id', 'id', { unique: true });
  playlistsStore.createIndex('name', 'name', { unique: false });
  playlistsStore.createIndex('imgSrc', 'imgSrc', { unique: false });
  playlistsStore.createIndex('createdBy', 'createdBy', { unique: false });
  playlistsStore.createIndex('tracks', 'tracks', { unique: false });
  playlistsStore.createIndex('followers', 'followers', { unique: false });
  playlistsStore.createIndex('pinned', 'pinned', { unique: false });
  playlistsStore.createIndex('lastPlayed', 'lastPlayed', { unique: false });

  // Initalize `tracksStore`
  const tracksStore = dbConn.createObjectStore(TRACKS_STORE_NAME, {
    keyPath: 'id',
  });
  tracksStore.createIndex('id', 'id', { unique: true });
  tracksStore.createIndex('src', 'src', { unique: false });
  tracksStore.createIndex('imgSrc', 'imgSrc', { unique: false });
  tracksStore.createIndex('title', 'title', { unique: false });
  tracksStore.createIndex('artist', 'artist', { unique: false });
  tracksStore.createIndex('album', 'album', { unique: false });
}
