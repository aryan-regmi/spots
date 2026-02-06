import { createStore, produce } from 'solid-js/store';
import { DBService, DBServiceError } from './dbService';
import { errAsync, ResultAsync } from 'neverthrow';
import { migrations } from './mockIndexDBMigrations';

export const USERS_STORE_NAME = 'users-store';
export const PLAYLISTS_STORE_NAME = 'playlists-store';
export const TRACKS_STORE_NAME = 'tracks-store';

/** Database store. */
const [dbStore, setDbStore] = createStore<DBService>({
  isReady: false,
  putRecord: () => errAsync(new DBServiceError('Not implemented')),
  getRecord: () => errAsync(new DBServiceError('Not implemented')),
  removeRecord: () => errAsync(new DBServiceError('Not implemented')),
  getAllRecords: () => errAsync(new DBServiceError('Not implemented')),
});

/** Runs a transaction and returns `ResultAsync`. */
function runTransaction<R>(
  stores: string[],
  mode: IDBTransactionMode,
  callback: (tx: IDBTransaction) => Promise<R>
) {
  const transactionResult = new Promise<R>((resolve, reject) => {
    const db = dbStore.database;
    if (!db) {
      return reject({ message: 'Database not ready' });
    }

    // Run callback on transaction
    const transaction = db.transaction(stores, mode);
    callback(transaction).then(resolve).catch(reject);

    // Handle transaction events
    transaction.oncomplete = () => resolve(undefined as any);
    transaction.onerror = () =>
      reject({ message: transaction.error?.message ?? 'Transaction failed' });
    transaction.onabort = transaction.onerror;
  });
  return ResultAsync.fromPromise<R, DBServiceError>(
    transactionResult,
    (err) => new DBServiceError((err as Error).message)
  );
}

/** Initializes the database. */
async function initDatabase() {
  // Open connection to the database.
  const DB_NAME = 'spots-db';
  const DB_VERSION = 1;
  const openRequest = indexedDB.open(DB_NAME, DB_VERSION);

  // Run migrations
  openRequest.onupgradeneeded = (e) => {
    console.debug('Running DB migrations');
    const db = (e.target as IDBOpenDBRequest).result;
    const currMigration = migrations.find((m) => m.version === DB_VERSION);
    if (currMigration) {
      currMigration.run(db, e);
    }
    console.debug(
      `DB migrations applied (v${currMigration?.version ?? DB_VERSION})`
    );
  };

  // Handle events
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    openRequest.onerror = () =>
      reject(openRequest.error ?? { message: 'Failed to open database' });
    openRequest.onsuccess = () => {
      console.debug('DB connection open');
      return resolve(openRequest.result);
    };
  });

  // Update database store with actual implementations
  setDbStore(
    produce((store) => {
      store.database = db;
      store.isReady = true;

      store.putRecord = <T>(
        store: string,
        value: T,
        key?: string,
        deps: string[] = []
      ) =>
        runTransaction([store, ...deps], 'readwrite', async (tx) => {
          const objectStore = tx.objectStore(store);
          await new Promise<void>((resolve, reject) => {
            const request = objectStore.put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = () =>
              reject({
                message: `Failed to put record in DB: ${request.error}`,
                info: { store, key, value },
              });
          });
        });

      store.getRecord = <T>(store: string, key: any, deps: string[] = []) =>
        runTransaction([store, ...deps], 'readonly', async (tx) => {
          const objectStore = tx.objectStore(store);
          return new Promise<T>((resolve, reject) => {
            const request = objectStore.get(key);
            request.onsuccess = () => resolve(request.result as T);
            request.onerror = () =>
              reject({
                message: `Failed to get record from DB: ${request.error}`,
                info: { store, key },
              });
          });
        });

      store.removeRecord = (store: string, key: any, deps: string[] = []) =>
        runTransaction([store, ...deps], 'readwrite', async (tx) => {
          const objectStore = tx.objectStore(store);
          await new Promise<void>((resolve, reject) => {
            const request = objectStore.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () =>
              reject({
                message: `Failed to delete record from DB: ${request.error}`,
                info: { store, key },
              });
          });
        });

      store.getAllRecords = <T>(store: string, deps: string[] = []) =>
        runTransaction([store, ...deps], 'readonly', async (tx) => {
          const objectStore = tx.objectStore(store);
          return new Promise<T[]>((resolve, reject) => {
            const request = objectStore.getAll();
            request.onsuccess = () => resolve(request.result as T[]);
            request.onerror = () =>
              reject({
                message: `Failed to get all record from DB: ${request.error}`,
                info: { store },
              });
          });
        });
    })
  );
}

/** Returns the database provider. */
export function useDBProvider() {
  return dbStore;
}

/** Initalize database once module is first imported. */
initDatabase();
