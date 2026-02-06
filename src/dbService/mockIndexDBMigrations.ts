import {
  AUTH_STORE_NAME,
  PLAYLISTS_STORE_NAME,
  TRACKS_STORE_NAME,
} from './mockDBServiceProvider';

export const migrations = [migrationV1];

/** Version 1 migration. */
function migrationV1(dbConn: IDBDatabase, event: IDBVersionChangeEvent) {
  const request = event.target as IDBOpenDBRequest;
  dbConn = request.result;
  console.log('Applying database migrations');

  // Initalize `authStore`
  const authStore = dbConn.createObjectStore(AUTH_STORE_NAME, {
    keyPath: 'user',
  });
  authStore.createIndex('user', 'user', { unique: true });
  authStore.createIndex('password', 'password', { unique: false });
  authStore.createIndex('isAuth', 'isAuth', { unique: false });
  authStore.transaction.oncomplete = () => {
    // Add dev user
    const store = dbConn
      .transaction(AUTH_STORE_NAME, 'readwrite')
      .objectStore(AUTH_STORE_NAME);
    store.put({ user: 'dev', password: 'dev', isAuth: false });
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

  // Initalize `tracksStore`
  const tracksStore = dbConn.createObjectStore(TRACKS_STORE_NAME, {
    keyPath: 'id',
  });
  tracksStore.createIndex('id', 'id', { unique: true });
  tracksStore.createIndex('src', 'src', { unique: false });
  tracksStore.createIndex('imgSrc', 'imgSrc', { unique: false });
  tracksStore.createIndex('imgSrc', 'imgSrc', { unique: false });
  tracksStore.createIndex('title', 'title', { unique: false });
  tracksStore.createIndex('artist', 'artist', { unique: false });
  tracksStore.createIndex('album', 'album', { unique: false });

  console.log('Applied migration (V1)');
}
