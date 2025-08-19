import { Store } from '@tauri-apps/plugin-store';

export type AuthData = {
    valid: boolean;
    username?: string;
};

/** Checks if the current session is authenticated. */
export async function isAuthenticated(store: Store | null) {
    let value = await store?.get<AuthData>('authenticated');
    return value;
}

/** Sets the auth token. */
export async function setAuth(store: Store | null, username: string) {
    await store?.set('authenticated', { valid: true, username });
}

/** Removes the auth token. */
export async function removeAuth(store: Store | null) {
    await store?.set('authenticated', { valid: false, username: null });
}

/** Gets the currently authenticated username. */
export async function getAuthUsername(store: Store | null) {
    let auth = await store?.get<AuthData>('authenticated');
    if (auth?.valid) {
        return auth.username;
    }
}
