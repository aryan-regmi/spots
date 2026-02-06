import { ResultAsync } from 'neverthrow';

/** Represents errors in the IndexDB service. */
export type IndexDBError = {
  message: string;
};

/** Service responsible for IndexDB operations. */
export type IndexDBService = {
  /** The database connection. */
  dbConn: IDBDatabase;

  /** Adds a record to the store. */
  putRecord: (
    storeName: string,
    record: any,
    dependencies?: string[]
  ) => ResultAsync<void, IndexDBError>;
};
