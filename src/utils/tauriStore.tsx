import { load, Store } from '@tauri-apps/plugin-store';
import { err, ok, ResultAsync } from 'neverthrow';
import { createContext, createResource, Resource, useContext } from 'solid-js';
import { Logger } from './logger';
import { createError } from './errors';

/** The path of the store. */
export const STORE_PATH = 'spots-store.json';

/** Errors returned by the store. */
export type StoreError =
  | { InvalidStore: 'Store must be initalized' }
  | { OpenStoreError: 'Unable to open the store' }
  | { AddEntryError: 'Unable to add entry to the store' };

/** The actual context. */
export type StoreInnerContext = {
  store: Resource<Store | undefined>;
  addEntry: <T>(
    store: Store,
    entry: {
      key: string;
      value: T;
    }
  ) => ResultAsync<void, StoreError>;
  getValue: <T>(
    store: Store,
    key: string
  ) => ResultAsync<T | undefined, StoreError>;
  removeEntry: (store: Store, key: string) => ResultAsync<boolean, StoreError>;
  saveStore: (store: Store) => ResultAsync<void, StoreError>;
  closeStore: (store: Store) => ResultAsync<void, StoreError>;
};

/** The `Store` context. */
export const StoreContext = createContext<StoreInnerContext>();

/** Provides the `Store` context. */
export function StoreProvider(props: { children: any }) {
  const [store] = createResource(async () => {
    return openStore().match(
      (store) => store,
      (error) => {
        Logger.error(`Failed to open store: ${JSON.stringify(error)}`);
        return undefined;
      }
    );
  });

  /** Create services for the provider. */
  const services = {
    store,
    addEntry,
    getValue,
    removeEntry,
    saveStore,
    closeStore,
  };

  return (
    <StoreContext.Provider value={services}>
      {props.children}
    </StoreContext.Provider>
  );
}

/** Exposes the `StoreContext` */
export function useStore() {
  return useContext(StoreContext);
}

/** Opens the store. */
function openStore() {
  return ResultAsync.fromPromise(
    new Promise<Store>((resolve, reject) => {
      try {
        const store = load(STORE_PATH);
        store.then(resolve);
      } catch (e) {
        reject(e as Error);
      }
    }),
    (e) =>
      createError(
        { OpenStoreError: 'Unable to open the store' },
        {
          store: STORE_PATH,
          error: e,
        }
      )
  );
}

/** Sets a value in the store. */
function addEntry<T>(store: Store, entry: { key: string; value: T }) {
  return ResultAsync.fromPromise(
    new Promise<void>((resolve, reject) => {
      try {
        store.set(entry.key, entry.value).then(resolve);
      } catch (e) {
        reject(e as Error);
      }
    }),
    (e) =>
      createError(
        { AddEntryError: 'Unable to add entry to the store' },
        { store, key: entry.key, error: e }
      )
  );
}

/** Gets the value for the given key. */
function getValue<T>(store: Store, key: string) {
  return ResultAsync.fromPromise(
    new Promise<T | undefined>((resolve, reject) => {
      try {
        store.get<T>(key).then(resolve);
      } catch (e) {
        reject(e as Error);
      }
    }),
    makeStoreError
  );
}

/**
 * Removes the entry with the given key from the store.
 *
 * Returns `true` if there was an entry to delete, else `false`.
 * */
function removeEntry(store: Store, key: string) {
  return ResultAsync.fromPromise(
    new Promise<boolean>((resolve, reject) => {
      try {
        store.delete(key).then(resolve);
      } catch (e) {
        reject(e as Error);
      }
    }),
    makeStoreError
  );
}

/** Saves the store. */
function saveStore(store: Store) {
  return ResultAsync.fromPromise(
    new Promise<void>((resolve, reject) => {
      try {
        store.save().then(resolve);
      } catch (e) {
        reject(e as Error);
      }
    }),
    makeStoreError
  );
}

/** Closes the store. */
function closeStore(store: Store) {
  return ResultAsync.fromPromise(
    new Promise<void>((resolve, reject) => {
      try {
        store.close().then(resolve);
      } catch (e) {
        reject(e as Error);
      }
    }),
    makeStoreError
  );
}
