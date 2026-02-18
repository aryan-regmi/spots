import { load, Store } from '@tauri-apps/plugin-store';
import { ResultAsync } from 'neverthrow';
import { createContext, createResource, Resource, useContext } from 'solid-js';
import { Logger } from './logger';

/** The path of the store. */
const STORE_PATH = 'spots-store.json';

/** Represents an error in `Store` operations. */
export type StoreError = {
  kind?: string;
  message: string;
  stack?: string;
};

/** The things */
export type StoreServices = {
  store: Resource<Store | undefined>;
  setValue: <T>(
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
  saveStore: (store: Store) => ResultAsync<void, StoreError>;
  closeStore: (store: Store) => ResultAsync<void, StoreError>;
};

/** The `Store` context. */
export const StoreContext = createContext<StoreServices>();

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
    setValue,
    getValue,
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
    makeStoreError
  );
}

/** Sets a value in the store. */
function setValue<T>(store: Store, entry: { key: string; value: T }) {
  return ResultAsync.fromPromise(
    new Promise<void>((resolve, reject) => {
      try {
        store.set(entry.key, entry.value).then(resolve);
      } catch (e) {
        reject(e as Error);
      }
    }),
    makeStoreError
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

/** Converts an `Error` to `StoreError` */
function makeStoreError(error: unknown) {
  const err = error as Error;
  return {
    kind: err.name,
    message: err.message,
    stack: err.stack,
  } as StoreError;
}
