import { ResultAsync } from 'neverthrow';

/** Represents errors in the database service. */
export type DBServiceError = {
  message: string;
};

/** Represents a database */
export interface Database extends EventTarget {
  close(): void;
}

/** Service responsible for database operations. */
export type DBService = {
  /** The database connection. */
  dbConn: Database;

  /** Adds a record to the store. */
  putRecord: <T>(
    storeName: string,
    record: T,
    key?: string,
    dependencies?: string[]
  ) => ResultAsync<void, DBServiceError>;

  /** Gets the specified record from the given store. */
  getRecord: <T>(
    storeName: string,
    key: string,
    dependencies?: string[]
  ) => ResultAsync<T, DBServiceError>;

  /** Removes the specified record from the given store. */
  removeRecord: (
    storeName: string,
    key: string,
    dependencies?: string[]
  ) => ResultAsync<void, DBServiceError>;

  /** Gets all records from the specified store. */
  getAllRecords: <T>(
    storeName: string,
    dependencies?: string[]
  ) => ResultAsync<T[], DBServiceError>;
};
