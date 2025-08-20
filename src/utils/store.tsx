import { load, Store } from '@tauri-apps/plugin-store';
import { useEffect, useState } from 'react';

/** Loads the specifed store. */
export function useStore(storeName: string) {
    const [store, setStore] = useState<Store>();
    useEffect(() => {
        const _loadStore = async () => setStore(await load(storeName));
        _loadStore();
        console.info(`Store loaded: ${storeName}`);
    }, [storeName]);
    return store;
}
