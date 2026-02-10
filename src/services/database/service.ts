import { ResultAsync } from 'neverthrow';

/** The error returned from an authentication service. */
export interface DBError {
  kind?: string;
  message: string;
  info?: any;
}

/** Represents a user record in the database. */
export type UserRecord = {
  /** The user's ID. */
  id: string;

  /** The user's username. */
  username: string;

  /** The user's password (hashed). */
  password: string;

  /** Whether or not the user is authenticated.. */
  isAuth: boolean;
};

/** Represents a playlist record in the database. */
export type PlaylistRecord = {
  /** The playlist's ID. */
  id: string;

  /** The playlist's name. */
  name: string;

  /** The playlist's cover image source. */
  imgSrc: string;

  /** The playlist's creator (reference to `id` of `UserRecord`). */
  createdBy: string;

  /** The tracks in the playlist (reference to `id` of `TrackRecord`). */
  tracks: string[];

  /** The playlist's followers (reference to `id` of `UserRecord`). */
  followers: string[];

  /** The list of users that have the playlist pinned (reference to `id` of `UserRecord`). */
  pinned: string[];

  /** The last time the playlist was played (timestamp). */
  lastPlayed?: string;

  /** Whether or not this is the playlist currently being played. */
  isCurrent: boolean;

  /** List of users that have downloaded this playlist (reference to `id` of `UserRecord`). */
  download: string[];
};

/** Represents a track record in the database. */
export type TrackRecord = {
  /** The track's ID. */
  id: string;

  /** The track's source. */
  src: string;

  /** The track's cover image source. */
  imgSrc: string;

  /** The track's name. */
  title: string;

  /** The track's artist. */
  artist: string;

  /** The album that the track belongs to. */
  album: string[];

  /** The list of users that have the track pinned (reference to `id` of `UserRecord`). */
  pinned: string[];

  /** The last time the track was played (timestamp). */
  lastPlayed?: string;

  /** Whether or not this is the track currently being played. */
  isCurrent: boolean;

  /** List of users that have downloaded this playlist (reference to `id` of `UserRecord`). */
  download: string[];
};

/** Represents a DB table ID. */
export type DBTableID =
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
  createRecord: <R>(tableId: DBTableID, value: R) => ResultAsync<void, DBError>;

  /** Reads the record with the given key from the specified table. */
  readRecord: <R, Key>(
    tableId: DBTableID,
    key: Key
  ) => ResultAsync<R | null, DBError>;

  /** Updates the record with the given key. */
  updateRecord: <R, Key>(
    tableId: DBTableID,
    key: Key,
    value: R
  ) => ResultAsync<void, DBError>;

  /** Deletes the record with the given key from the specified table.
   *
   * # Note
   * The deleted record is returned if the delete was successful.
   * */
  deleteRecord: <R, Key>(
    tableId: DBTableID,
    key: Key
  ) => ResultAsync<R, DBError>;

  /** Reads all records from the specified table. */
  readAllRecords: <R>(tableId: DBTableID) => ResultAsync<R[], DBError>;

  /** Closes the database connection. */
  close: () => ResultAsync<void, DBError>;
}
