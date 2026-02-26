import { Logger } from '@/utils/logger';
import { ResultAsync } from 'neverthrow';
import {
  createContext,
  createResource,
  onCleanup,
  onMount,
  ResourceReturn,
  useContext,
} from 'solid-js';
import { SpotsError } from '@/utils/errors';
import { load, Store } from '@tauri-apps/plugin-store';
import { AUTH_TOKEN_KEY, AUTH_USERID_KEY } from '@/api/auth';

/** The path of the store. */
export const STORE_PATH = 'spots-store.json';

/** The actual context. */
export type StoreContext = {
  /** Opens the store. */
  openStore: () => ResultAsync<Store, SpotsError>;

  /** Sets a value in the store. */
  addEntry: <T>(
    store: Store,
    entry: {
      key: string;
      value: T;
    }
  ) => ResultAsync<void, SpotsError>;

  /** Gets the value for the given key. */
  getValue: <T>(
    store: Store,
    key: string
  ) => ResultAsync<T | undefined, SpotsError>;

  /**
   * Removes the entry with the given key from the store.
   *
   * Returns `true` if there was an entry to delete, else `false`.
   * */
  removeEntry: (store: Store, key: string) => ResultAsync<boolean, SpotsError>;

  /** Saves the store. */
  saveStore: (store: Store) => ResultAsync<void, SpotsError>;

  /** Closes the store. */
  closeStore: (store: Store) => ResultAsync<void, SpotsError>;
};

/** The `Store` context. */
export const StoreCtx = createContext<StoreContext>();

/** Provides the `Store` context. */
export function StoreProvider(props: { children: any }) {
  /** Opens the store when the provider is mounted. */
  onMount(async () => {
    const opened = await openStore();
    if (opened.isOk()) {
      Logger.info(`Opened store: ${STORE_PATH}`);
    } else {
      Logger.error(`Failed to open store: ${opened.error.kind}`);
    }
  });

  /** Saves the store when unmounted. */
  onCleanup(() => {
    openStore()
      .andThen((store) => saveStore(store).map(() => store))
      .andTee(() => Logger.info(`Store saved: ${STORE_PATH}`))
      .andThen(closeStore)
      .match(
        (_ok) => Logger.info('Store closed'),
        (err) => {
          Logger.error(`${err.kind}: ${err.message}`, err.info);
        }
      );
  });

  /** Create services for the provider. */
  const services = {
    openStore,
    addEntry,
    getValue,
    removeEntry,
    saveStore,
    closeStore,
  };

  return (
    <StoreCtx.Provider value={services}>{props.children}</StoreCtx.Provider>
  );
}

/** Exposes the `StoreContext` */
export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}

/** Extracts the auth token from the store. */
export function getAuthTokenResource(
  storeCtx: StoreContext
): ResourceReturn<string | undefined> {
  return createResource(
    () => storeCtx.openStore(),
    async () => {
      return await storeCtx
        .openStore()
        .andThen((store) => storeCtx.getValue<string>(store, AUTH_TOKEN_KEY))
        .match(
          (token) => token,
          (err) => {
            Logger.error(`${err.kind}: ${err.message}`, err.info);
            return undefined;
          }
        );
    }
  );
}

/** Extracts the auth user ID from the store. */
export function getAuthUserIdResource(
  storeCtx: StoreContext
): ResourceReturn<string | undefined> {
  return createResource(
    () => storeCtx.openStore(),
    async () => {
      return await storeCtx
        .openStore()
        .andThen((store) => storeCtx.getValue<string>(store, AUTH_USERID_KEY))
        .match(
          (token) => token,
          (err) => {
            Logger.error(`${err.kind}: ${err.message}`, err.info);
            return undefined;
          }
        );
    }
  );
}

function openStore(): ResultAsync<Store, SpotsError> {
  return ResultAsync.fromPromise(load(STORE_PATH), (e) => ({
    kind: 'StoreOpenError',
    message: 'Unable to open the store',
    info: { storePath: STORE_PATH, error: e as Error },
  }));
}

function addEntry<T>(
  store: Store,
  entry: { key: string; value: T }
): ResultAsync<void, SpotsError> {
  return ResultAsync.fromPromise(store.set(entry.key, entry.value), (e) => ({
    kind: 'StoreAddEntryError',
    message: 'Unable to add entry to the store',
    info: { store, entry, error: e as Error },
  }));
}

function getValue<T>(
  store: Store,
  key: string
): ResultAsync<T | undefined, SpotsError> {
  return ResultAsync.fromPromise(store.get<T>(key), (e) => ({
    kind: 'StoreGetValueError',
    message: 'Unable to get value from the store',
    info: { store, key, error: e as Error },
  }));
}

function removeEntry(
  store: Store,
  key: string
): ResultAsync<boolean, SpotsError> {
  return ResultAsync.fromPromise(store.delete(key), (e) => ({
    kind: 'StoreRemoveEntryError',
    message: 'Unable to delete entry from the store',
    info: { store, key, error: e as Error },
  }));
}

function saveStore(store: Store): ResultAsync<void, SpotsError> {
  return ResultAsync.fromPromise(store.save(), (e) => ({
    kind: 'StoreSaveError',
    message: 'Unable to save the store data',
    info: { store, error: e as Error },
  }));
}

function closeStore(store: Store): ResultAsync<void, SpotsError> {
  return ResultAsync.fromPromise(store.close(), (e) => ({
    kind: 'StoreCloseError',
    message: 'Unable to close the store',
    info: { store, error: e as Error },
  }));
}
