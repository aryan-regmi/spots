import { AuthData } from '../components/Authenticator';
import { Store } from '@tauri-apps/plugin-store';
import { useEffect, useState } from 'react';

/** Gets the currently authenticated username from the store. */
export default function useAuthUsername(store?: Store) {
    const [username, setUsername] = useState<string>();
    useEffect(() => {
        async function getUsername() {
            let auth = await store?.get<AuthData>('authenticated');
            if (auth?.isValid) {
                setUsername(auth.username ?? '');
            }
        }
        getUsername();
    }, [store]);
    return username;
}
