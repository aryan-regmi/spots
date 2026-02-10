import { createStore } from 'solid-js/store';
import { DBError, DBState, DBTableId } from './service';
import { createSignal } from 'solid-js';
import { ResultAsync } from 'neverthrow';
import { useLogger } from '../logger/provider';
import * as uuid from 'uuid';

export const USERS_STORE_NAME = 'users-store';
export const PLAYLISTS_STORE_NAME = 'playlists-store';
export const TRACKS_STORE_NAME = 'tracks-store';

/** Initalizes the IndexDB database provider. */
async function initDBProvider() {
  const DB_NAME = 'spots-db';
  const DB_VERSION = 1;

  const connection = await initDatabase(DB_NAME, DB_VERSION, migrations);

  /** The database service state. */
  const [state, setState] = createStore<DBState<IDBDatabase>>({
    name: DB_NAME,
    version: DB_VERSION,
    connection: null,
    isReady: false,
  });

  function createRecord<T>(table: DBTableId, value: T) {}

  /** Runs a transaction and converts result to `ResultAsync`. */
  function runTransaction<R>(
    stores: string[],
    mode: IDBTransactionMode,
    callback: (tx: IDBTransaction) => Promise<R>
  ) {
    const transactionResult = new Promise<R>((resolve, reject) => {
      const db = state.connection;
      if (!db) {
        return reject({ message: 'Database not ready', info: state.name });
      }

      // Run callback on transaction
      const transaction = db.transaction(stores, mode);
      callback(transaction).then(resolve).catch(reject);

      // Handle transaction events
      transaction.oncomplete = () => resolve(undefined as any);
      transaction.onerror = () =>
        reject({
          kind: 'Transaction Error',
          message:
            transaction.error?.message ?? 'Unable to complete transaction',
          info: transaction.error?.stack ?? transaction,
        });
      transaction.onabort = transaction.onerror;
    });
    return ResultAsync.fromPromise<R, DBError>(transactionResult, (err) => ({
      message: (err as Error).message,
    }));
  }
}

/** Type of migrations for IndexDB. */
type Migration = {
  version: number;
  run: (event: IDBVersionChangeEvent) => void;
};

/** Initalizes the underlying IndexDB database. */
async function initDatabase(
  dbName: string,
  dbVersion: number,
  migrations: Migration[]
) {
  const logger = useLogger();
  const dbLogInfo = { database: dbName, version: dbVersion };

  // Open DB connection
  const openRequest = indexedDB.open(dbName, dbVersion);

  // Run migrations
  openRequest.onupgradeneeded = (e) => {
    logger.info('Initial DB connection', dbLogInfo);
    logger.info('Running migrations', dbLogInfo);
    const currentMigration = migrations.find((m) => m.version === dbVersion);
    if (currentMigration) {
      currentMigration.run(e);
      logger.info('Migrations applied', dbLogInfo);
    } else {
      logger.warn('No migrations found', dbLogInfo);
    }
  };

  // Handle open request
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    // Propagate error
    openRequest.onerror = () =>
      reject(
        openRequest.error
          ? {
              kind: 'DB Open Error',
              message: openRequest.error.message,
              info: openRequest.error.stack,
            }
          : {
              kind: 'DB Open Error',
              message: 'Unable to open database connection',
              info: dbLogInfo,
            }
      );

    // Open the connection
    openRequest.onsuccess = (e) => {
      logger.info('DB connection open', dbLogInfo);
      return resolve((e.target as IDBOpenDBRequest).result);
    };
  });

  return db;
}

/** The database migrations. */
const migrations: Migration[] = [
  {
    version: 1,
    run: (e) => {
      const dbConn = (e.target as IDBOpenDBRequest).result;
      indexedDB.deleteDatabase(dbConn.name);

      // Initalize `userStore`
      const userStore = dbConn.createObjectStore(USERS_STORE_NAME, {
        keyPath: 'username',
      });
      userStore.createIndex('username', 'username', { unique: true });
      userStore.createIndex('password', 'password', { unique: false });
      userStore.createIndex('isAuth', 'isAuth', { unique: true });
      userStore.createIndex('id', 'id', { unique: true });

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
    },
  },
];
