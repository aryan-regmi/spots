import { createStore } from 'solid-js/store';
import { DBError, DBService, DBState, DBTableId } from './service';
import { Component, createContext, useContext } from 'solid-js';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import { useLogger } from '../logger/provider';
import { createAsync } from '@solidjs/router';

export const USERS_STORE_NAME = 'users-store';
export const PLAYLISTS_STORE_NAME = 'playlists-store';
export const TRACKS_STORE_NAME = 'tracks-store';

/** Initalizes the IndexDB database provider. */
async function initDBProvider(): Promise<DBService<IDBDatabase>> {
  const DB_NAME = 'spots-db';
  const DB_VERSION = 1;
  const connection = await initDatabase(DB_NAME, DB_VERSION, migrations);

  /** The database service state. */
  const [state, setState] = createStore<DBState<IDBDatabase>>({
    name: DB_NAME,
    version: DB_VERSION,
    connection,
    isReady: false,
  });

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

  /** Gets the name from a `DBTableId`. */
  function getTableName(tableId: DBTableId): ResultAsync<string, DBError> {
    // indexedDB only requires store/table names
    if (tableId.kind !== 'name') {
      return errAsync({
        kind: 'Invalid Table Id',
        message:
          'Must provide a `tableName` to `createRecord` (provided `tableId`)',
        info: { tableId },
      });
    }
    return okAsync(tableId.name);
  }

  /** Creates a new record. */
  function createRecord<R>(tableId: DBTableId, value: R) {
    setState('isReady', false);
    return getTableName(tableId).andThen((tableName) =>
      runTransaction([tableName], 'readwrite', async (tx) => {
        const objectStore = tx.objectStore(tableName);
        await new Promise<void>((resolve, reject) => {
          const request = objectStore.add(value);
          request.onsuccess = () => resolve();
          request.onerror = () =>
            reject({
              kind: 'Create Record Error',
              message: 'Unable to create new record',
              info: { table: tableName, record: value, error: request.error },
            });
        });
      }).andTee(() => setState('isReady', true))
    );
  }

  /** Reads the record with the given key from the specified table. */
  function readRecord<R, Key = IDBValidKey | IDBKeyRange>(
    tableId: DBTableId,
    key: Key
  ) {
    setState('isReady', false);
    return getTableName(tableId).andThen((tableName) =>
      runTransaction([tableName], 'readonly', async (tx) => {
        const objectStore = tx.objectStore(tableName);
        return await new Promise<R>((resolve, reject) => {
          const request = objectStore.get(key as IDBValidKey | IDBKeyRange);
          request.onsuccess = () => resolve(request.result as R);
          request.onerror = () =>
            reject({
              kind: 'Record Not Found',
              message: 'Unable to retrieve specified record',
              info: { table: tableName, key, error: request.error },
            });
        });
      }).andTee(() => setState('isReady', true))
    );
  }

  /** Updates the record with the given key. */
  function updateRecord<R, Key = IDBValidKey>(
    tableId: DBTableId,
    key: Key,
    value: R
  ) {
    setState('isReady', false);
    return getTableName(tableId).andThen((tableName) =>
      runTransaction([tableName], 'readwrite', async (tx) => {
        const objectStore = tx.objectStore(tableName);
        return await new Promise<void>((resolve, reject) => {
          const request = objectStore.put(value, key as IDBValidKey);
          request.onsuccess = () => resolve();
          request.onerror = () =>
            reject({
              kind: 'Update Record Error',
              message: 'Unable to update record',
              info: {
                table: tableName,
                key,
                newRecord: value,
                error: request.error,
              },
            });
        });
      }).andTee(() => setState('isReady', true))
    );
  }

  /** Deletes the record with the given key from the specified table.
   *
   * # Note
   * The deleted record is returned if the delete was successful.
   * */
  function deleteRecord<R, Key = IDBValidKey | IDBKeyRange>(
    tableId: DBTableId,
    key: Key
  ) {
    setState('isReady', false);
    return getTableName(tableId).andThen((tableName) =>
      runTransaction([tableName], 'readwrite', async (tx) => {
        const objectStore = tx.objectStore(tableName);
        return await new Promise<R>((resolve, reject) => {
          // Store record being deleted to return later
          const toDelete = readRecord<R>(
            tableId,
            key as IDBValidKey | IDBKeyRange
          );

          toDelete.match(
            (deleteRecord) => {
              // Request deletion
              const request = objectStore.delete(
                key as IDBValidKey | IDBKeyRange
              );
              request.onsuccess = () => resolve(deleteRecord);
              request.onerror = () =>
                reject({
                  kind: 'Delete Record Error',
                  message: 'Unable to delete record',
                  info: {
                    table: tableName,
                    key,
                    toDelete: deleteRecord,
                    error: request.error,
                  },
                });
            },
            (err) => err
          );
        });
      }).andTee(() => setState('isReady', true))
    );
  }

  /** Reads all records from the specified table. */
  function readAllRecords<R>(tableId: DBTableId) {
    return getTableName(tableId).andThen((tableName) =>
      runTransaction([tableName], 'readonly', async (tx) => {
        const objectStore = tx.objectStore(tableName);
        return await new Promise<R[]>((resolve, reject) => {
          const request = objectStore.getAll();
          request.onsuccess = () => resolve(request.result as R[]);
          request.onerror = () =>
            reject({
              kind: 'Read All Failed',
              message: 'Unable to retrieve all records from specified table',
              info: { table: tableName, error: request.error },
            });
        });
      }).andTee(() => setState('isReady', true))
    );
  }

  /** Closes the database connection. */
  function close() {
    setState('isReady', false);
    if (state.connection) {
      return okAsync(state.connection.close());
    }
    return errAsync({
      kind: 'Close Failed',
      message: 'Unable to close the database connection',
      info: state,
    });
  }

  return {
    state: state,
    createRecord,
    readRecord,
    updateRecord,
    deleteRecord,
    readAllRecords,
    close,
  };
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

// --------Context Provider-------- //
// -------------------------------- //

const IndexDBContext = createContext<DBService<IDBDatabase>>();

/** Provides the context for the database service. */
export const IndexDBProvider: Component<{ children: any }> = (props) => {
  const db = createAsync(initDBProvider);

  return (
    <IndexDBContext.Provider value={db()}>
      {props.children}
    </IndexDBContext.Provider>
  );
};

/** Hook to use the logger service. */
export function useIndexDB() {
  const logger = useContext(IndexDBContext);
  if (!logger) {
    throw new Error('useLogger must be used within LoggerContextProvider');
  }
  return logger;
}
