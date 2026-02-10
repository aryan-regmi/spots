import { ResultAsync } from 'neverthrow';

/** The error returned from an authentication service. */
export interface DBError {
  kind?: string;
  message: string;
  info?: any;
}

/** Represents a DB table ID. */
export type DBTableId = { tableName: string } | { tableId: string };

/** The state for the database service. */
export interface DBState<T> {
  /** Name of the database. */
  name: string;

  /** The version of the database. */
  version: number | string;

  /** The underlying database connection. */
  connection: T | null;

  /** If the state is ready (no DB operations being done). */
  isReady: boolean;
}

/** Defines the provider interface for the database service. */
export interface DBServiceProvider<T> {
  /** The database state. */
  state: DBState<T>;

  /** Creates a new record. */
  createRecord: <T>(table: DBTableId, value: T) => ResultAsync<void, DBError>;

  /** Reads the record with the given key from the specified table. */
  readRecord: <T, Key = any>(
    table: DBTableId,
    key: Key
  ) => ResultAsync<T | null, DBError>;

  /** Updates the record with the given key. */
  updateRecord: <T, Key = any>(
    table: DBTableId,
    key: Key,
    value: T
  ) => ResultAsync<void, DBError>;

  /** Deletes the record with the given key from the specified table.
   *
   * # Note
   * The deleted record is returned if the delete was successful.
   * */
  deleteRecord: <T, Key = any>(
    table: DBTableId,
    key: Key
  ) => ResultAsync<T, DBError>;

  /** Reads all records from the specified table. */
  readAllRecords: <T>(table: DBTableId) => ResultAsync<T[], DBError>;

  /** Closes the database connection. */
  close: () => ResultAsync<void, DBError>;
}
