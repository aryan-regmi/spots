import { load, Store } from '@tauri-apps/plugin-store';
import { useEffect, useState } from 'react';

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
