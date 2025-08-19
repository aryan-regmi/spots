import { load, Store } from '@tauri-apps/plugin-store';
import { useEffect, useState } from 'react';

/** Asserts the given condtion. */
export function assert(
    condtion: unknown,
    message = 'Assertion failed'
): asserts condtion {
    if (!condtion) {
        // alert(message);
        throw new Error(message);
    }
}

/** The data returned by the `LoginForm` component. */
export type UserData = {
    username: string;
    password: string;
};

/** Loads the specifed store. */
export function loadStore(storeName: string) {
    const [store, setStore] = useState<Store | null>(null);
    useEffect(() => {
        const _loadStore = async () => setStore(await load(storeName));
        if (store == null) {
            _loadStore();
            console.info(`Store loaded: ${storeName}`);
        }
    }, []);
    return store;
}
