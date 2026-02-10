import { createStore } from 'solid-js/store';
import { DBError, DBState, DBTableId } from './service';
import { createSignal } from 'solid-js';
import { ResultAsync } from 'neverthrow';

/** Initalizes the IndexDB database provider. */
const initDBProvider = () => {
  const DB_NAME = 'spots-db';
  const DB_VERSION = 1;

  /** The database service state. */
  const [state, setState] = createStore<DBState<IDBDatabase>>({
    name: DB_NAME,
    version: DB_VERSION,
    connection: null,
    isReady: false,
  });

  function createRecord<T>(table: DBTableId, value: T) {}

  /** Runs a transaction and converts result to `ResultAsync`. */
  function runTransaction<R>(
    stores: string[],
    mode: IDBTransactionMode,
    callback: (tx: IDBTransaction) => Promise<R>
  ) {
    const transactionResult = new Promise<R>((resolve, reject) => {
      const db = state.connection;
      if (!db) {
        return reject({ message: 'Database not ready', info: state.name });
      }

      // Run callback on transaction
      const transaction = db.transaction(stores, mode);
      callback(transaction).then(resolve).catch(reject);

      // Handle transaction events
      transaction.oncomplete = () => resolve(undefined as any);
      transaction.onerror = () =>
        reject({
          kind: 'Transaction Error',
          message:
            transaction.error?.message ?? 'Unable to complete transaction',
          info: transaction.error?.stack ?? transaction,
        });
      transaction.onabort = transaction.onerror;
    });
    return ResultAsync.fromPromise<R, DBError>(transactionResult, (err) => ({
      message: (err as Error).message,
    }));
  }
};

/** Type of migrations for IndexDB. */
type Migration = {
  version: number;
  run: (event: IDBVersionChangeEvent) => void;
};

/** Runs the database migrations */
function runMigrations(event: IDBVersionChangeEvent, migrations: Migration[]) {}
