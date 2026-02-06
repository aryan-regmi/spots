import { IndexDBError, IndexDBService } from '@/dbService/indexDBService';
import { migrations } from './mockIndexDBMigrations';
import { errAsync, fromPromise, okAsync, ResultAsync } from 'neverthrow';

/** Provides the `IndexDBService` */
export function useIndexDBService(): IndexDBService {
  return {
    dbConn,
    putRecord,
  };
}

/** Name of the auth store. */
export const AUTH_STORE_NAME = 'auth-store';

/** Name of the playlists store. */
export const PLAYLISTS_STORE_NAME = 'playlists-store';

/** Name of the tracks store. */
export const TRACKS_STORE_NAME = 'tracks-store';

/** Database name. */
const DB_NAME = 'spots-db';

/** Current database version. */
const DB_VERSION = 1;

/** The database connection. */
let dbConn: IDBDatabase;

/** Initial request to open the database. */
const openDbRequest = window.indexedDB.open(DB_NAME, DB_VERSION);

/** Handles DB opening errors. */
openDbRequest.onerror = (event) => {
  const request = event.target as IDBOpenDBRequest;
  console.error(`Unable to open database: ${request.error?.message}`);
};

/** Handles DB succefully opening. */
openDbRequest.onsuccess = (event) => {
  const request = event.target as IDBOpenDBRequest;
  dbConn = request.result;
  console.log('Database opened');
};

/** Handles DB migrations. */
openDbRequest.onupgradeneeded = (event) => {
  migrations.forEach((migration) => migration(dbConn, event));
};

/** Adds a record to the store. */
function putRecord(
  storeName: string,
  record: any,
  dependencies?: string[]
): ResultAsync<void, IndexDBError> {
  const runTransaction = new Promise<void>((resolve, reject) => {
    // Start transaction
    const transactionStores = dependencies
      ? [storeName, ...dependencies]
      : storeName;
    const transaction = dbConn.transaction(transactionStores, 'readwrite');
    const store = transaction.objectStore(storeName);

    // Put record in store
    store.put(record);

    // Handle transaction events
    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = (event) => {
      const transaction = event.target as IDBTransaction;
      reject({ message: `Transaction failed: ${transaction.error?.message}` });
    };
  });

  return fromPromise<void, IndexDBError>(
    runTransaction,
    (originalError) => originalError as IndexDBError
  );
}
