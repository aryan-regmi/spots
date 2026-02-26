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
import { createError, extractError, SpotsError } from '@/utils/errors';
import { load, Store } from '@tauri-apps/plugin-store';
import { AUTH_TOKEN_KEY, AUTH_USERID_KEY } from '@/api/auth';

/** The path of the store. */
export const STORE_PATH = 'spots-store.json';

/** Errors returned by the store. */
export type StoreError =
  | { InvalidStore: 'Store must be initalized' }
  | { OpenError: 'Unable to open the store' }
  | { AddEntryError: 'Unable to add entry to the store' }
  | { GetValueError: 'Unable to get value from the store' }
  | { RemoveEntryError: 'Unable to delete entry from the store' }
  | { SaveError: 'Unable to save the store data' }
  | { CloseError: 'Unable to close the store' };

/** The actual context. */
export type StoreContext = {
  openStore: () => ResultAsync<Store, SpotsError>;
  addEntry: <T>(
    store: Store,
    entry: {
      key: string;
      value: T;
    }
  ) => ResultAsync<void, SpotsError>;
  getValue: <T>(
    store: Store,
    key: string
  ) => ResultAsync<T | undefined, SpotsError>;
  removeEntry: (store: Store, key: string) => ResultAsync<boolean, SpotsError>;
  saveStore: (store: Store) => ResultAsync<void, SpotsError>;
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
          const errData = extractError(err);
          Logger.error(`${errData.kind}: ${errData.message}: ${errData.info}`);
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
            const errData = extractError(err);
            Logger.error(
              `${errData.kind}: ${errData.message}: ${errData.info}`
            );
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
            const errData = extractError(err);
            Logger.error(
              `${errData.kind}: ${errData.message}: ${errData.info}`
            );
            return undefined;
          }
        );
    }
  );
}

/** Opens the store. */
function openStore() {
  return ResultAsync.fromPromise(load(STORE_PATH), (e) =>
    createError(
      { OpenError: 'Unable to open the store' },
      {
        store: STORE_PATH,
        error: e,
      }
    )
  );
}

/** Sets a value in the store. */
function addEntry<T>(store: Store, entry: { key: string; value: T }) {
  return ResultAsync.fromPromise(store.set(entry.key, entry.value), (e) =>
    createError(
      { AddEntryError: 'Unable to add entry to the store' },
      { store, key: entry.key, error: e }
    )
  );
}

/** Gets the value for the given key. */
function getValue<T>(store: Store, key: string) {
  return ResultAsync.fromPromise(store.get<T>(key), (e) =>
    createError(
      { GetValueError: 'Unable to get value from the store' },
      { store, key, error: e }
    )
  );
}

/**
 * Removes the entry with the given key from the store.
 *
 * Returns `true` if there was an entry to delete, else `false`.
 * */
function removeEntry(store: Store, key: string) {
  return ResultAsync.fromPromise(store.delete(key), (e) =>
    createError(
      { RemoveEntryError: 'Unable to delete entry from the store' },
      { store, key, error: e }
    )
  );
}

/** Saves the store. */
function saveStore(store: Store) {
  return ResultAsync.fromPromise(store.save(), (e) =>
    createError(
      { SaveError: 'Unable to save the store data' },
      { store, error: e }
    )
  );
}

/** Closes the store. */
function closeStore(store: Store) {
  return ResultAsync.fromPromise(store.close(), (e) =>
    createError(
      { CloseError: 'Unable to close the store' },
      { store, error: e }
    )
  );
}
