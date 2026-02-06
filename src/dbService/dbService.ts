import { ResultAsync } from 'neverthrow';

/** Represents errors in the database service. */
export class DBServiceError extends Error {}
export interface DBServiceError {
  message: string;
  info?: any;
}

// TODO: Make this work with all databases (not just indexDB)?

/** Service responsible for database operations. */
export interface DBService {
  /** The database connection. */
  database?: IDBDatabase;

  /** Determines if the database is ready. */
  isReady: boolean;

  /** Adds a record to the store. */
  putRecord: <T>(
    store: string,
    value: T,
    key?: string,
    deps?: string[]
  ) => ResultAsync<void, DBServiceError>;

  /** Gets the specified record from the given store. */
  getRecord: <T>(
    store: string,
    key: string,
    deps?: string[]
  ) => ResultAsync<T | undefined, DBServiceError>;

  /** Removes the specified record from the given store. */
  removeRecord: (
    store: string,
    key: string,
    deps?: string[]
  ) => ResultAsync<void, DBServiceError>;

  /** Gets all records from the specified store. */
  getAllRecords: <T>(
    store: string,
    deps?: string[]
  ) => ResultAsync<T[], DBServiceError>;
}
