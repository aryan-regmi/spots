import { DBServiceError, DBService } from '@/dbService/dbService';
import { migrations } from './mockIndexDBMigrations';
import { fromPromise, fromThrowable, ResultAsync } from 'neverthrow';

/** Provides the database service. */
export function useDbService(): DBService {
  return {
    dbConn,
    putRecord,
    getRecord,
    removeRecord,
    getAllRecords,
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

/** Initalizes the database. */
const initDatabase = new Promise<IDBDatabase>((resolve, reject) => {
  /** Initial request to open the database. */
  const openDbRequest = window.indexedDB.open(DB_NAME, DB_VERSION);

  /** Handles DB opening errors. */
  openDbRequest.onerror = (event) => {
    const request = event.target as IDBOpenDBRequest;
    console.error(`Unable to open database: ${request.error?.message}`);
    reject();
  };

  /** Handles DB succefully opening. */
  openDbRequest.onsuccess = (event) => {
    const request = event.target as IDBOpenDBRequest;
    console.log('Database opened');
    resolve(request.result);
  };

  /** Handles DB migrations. */
  openDbRequest.onupgradeneeded = (event) => {
    const migration = migrations.find((m) => m.version === DB_VERSION);
    if (migration) {
      migration.migrationV1(dbConn, event);
    }
  };
});

/** The database connection. */
const dbConn: IDBDatabase = await initDatabase;

/** Adds a record to the store. */
function putRecord<T>(
  storeName: string,
  value: T,
  key?: string,
  dependencies?: string[]
): ResultAsync<void, DBServiceError> {
  const runTransaction = new Promise<void>((resolve, reject) => {
    // Start transaction
    const transactionStores = dependencies
      ? [storeName, ...dependencies]
      : storeName;
    const transaction = dbConn.transaction(transactionStores, 'readwrite');
    const store = transaction.objectStore(storeName);

    // Put record in store
    store.put(value, key);

    // Handle transaction events
    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => {
      const transaction = event.target as IDBTransaction;
      reject({ message: `Transaction failed: ${transaction.error?.message}` });
    };
    transaction.onabort = transaction.onerror;
  });

  return fromPromise<void, DBServiceError>(runTransaction, (originalError) => {
    if (originalError instanceof Error) {
      return { message: originalError.message };
    }
    return originalError as DBServiceError;
  });
}

/** Gets the specified record from the given store. */
function getRecord<T>(storeName: string, key: any, dependencies?: string[]) {
  console.log(storeName, key);
  const runTransaction = new Promise<T>((resolve, reject) => {
    // Start transaction
    const transactionStores = dependencies
      ? [storeName, ...dependencies]
      : storeName;
    const transaction = dbConn.transaction(transactionStores, 'readonly');
    const store = transaction.objectStore(storeName);

    // Request the record
    let request = store.get(key);

    // Handle transaction events
    request.onsuccess = (event) => {
      const value = event.target as IDBRequest<T>;
      resolve(value.result);
    };
    request.onerror = (event) => {
      const value = event.target as IDBRequest<T>;
      reject({ message: `Transaction failed: ${value.error?.message}` });
    };
  });

  return fromPromise<T, DBServiceError>(runTransaction, (originalError) => {
    if (originalError instanceof Error) {
      return { message: originalError.message };
    }
    return originalError as DBServiceError;
  });
}

/** Removes the specified record from the given store. */
function removeRecord<T>(storeName: string, key: any, dependencies?: string[]) {
  const runTransaction = new Promise<void>((resolve, reject) => {
    // Start transaction
    const transactionStores = dependencies
      ? [storeName, ...dependencies]
      : storeName;
    const transaction = dbConn.transaction(transactionStores, 'readonly');
    const store = transaction.objectStore(storeName);

    // Request record deletion
    store.delete(key);

    // Handle transaction events
    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => {
      const value = event.target as IDBRequest<T>;
      reject({ message: `Transaction failed: ${value.error?.message}` });
    };
    transaction.onabort = transaction.onerror;
  });

  return fromPromise(runTransaction, (originalError) => {
    if (originalError instanceof Error) {
      return { message: originalError.message };
    }
    return originalError as DBServiceError;
  });
}

/** Gets all records from the specified store. */
function getAllRecords<T>(storeName: string, dependencies?: string[]) {
  const runTransaction = new Promise<T[]>((resolve, reject) => {
    // Start transaction
    const transactionStores = dependencies
      ? [storeName, ...dependencies]
      : storeName;
    const transaction = dbConn.transaction(transactionStores, 'readonly');
    const store = transaction.objectStore(storeName);

    // Request the record
    let request = store.getAll();

    // Handle transaction events
    request.onsuccess = (event) => {
      const value = event.target as IDBRequest<T[]>;
      resolve(value.result);
    };
    request.onerror = (event) => {
      const value = event.target as IDBRequest<T[]>;
      reject({ message: `Transaction failed: ${value.error?.message}` });
    };
  });

  return fromPromise<T[], DBServiceError>(runTransaction, (originalError) => {
    if (originalError instanceof Error) {
      return { message: originalError.message };
    }
    return originalError as DBServiceError;
  });
}
