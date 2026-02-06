import { ResultAsync } from 'neverthrow';

/** Represents errors in the database service. */
export type DBError = {
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
    dependencies?: string[]
  ) => ResultAsync<void, DBError>;

  /** Gets the specified record from the given store. */
  getRecord: <T>(
    storeName: string,
    key: any,
    dependencies?: string[]
  ) => ResultAsync<T, DBError>;

  /** Removes the specified record from the given store. */
  removeRecord: (
    storeName: string,
    record: any,
    dependencies?: string[]
  ) => ResultAsync<void, DBError>;
};
