import { ResultAsync } from 'neverthrow';

/** The error returned from an authentication service. */
export interface DBError {
  kind?: string;
  message: string;
  info?: any;
}

/** Represents a DB table ID. */
export type DBTableId =
  | { kind: 'name'; name: string }
  | { kind: 'id'; id: string };

/** The state for the database service. */
export interface DBState<T> {
  /** Name of the database. */
  name: string;

  /** The version of the database. */
  version: number;

  /** The underlying database connection. */
  connection: T | null;

  /** If the state is ready (no DB operations being done). */
  isReady: boolean;
}

/** Defines the interface for the database service. */
export interface DBService<T> {
  /** The database state. */
  state: DBState<T>;

  /** Creates a new record. */
  createRecord: <R>(tableId: DBTableId, value: R) => ResultAsync<void, DBError>;

  /** Reads the record with the given key from the specified table. */
  readRecord: <R, Key>(
    tableId: DBTableId,
    key: Key
  ) => ResultAsync<R | null, DBError>;

  /** Updates the record with the given key. */
  updateRecord: <R, Key>(
    tableId: DBTableId,
    key: Key,
    value: R
  ) => ResultAsync<void, DBError>;

  /** Deletes the record with the given key from the specified table.
   *
   * # Note
   * The deleted record is returned if the delete was successful.
   * */
  deleteRecord: <R, Key>(
    tableId: DBTableId,
    key: Key
  ) => ResultAsync<R, DBError>;

  /** Reads all records from the specified table. */
  readAllRecords: <R>(tableId: DBTableId) => ResultAsync<R[], DBError>;

  /** Closes the database connection. */
  close: () => ResultAsync<void, DBError>;
}
