import { Store } from '@tauri-apps/plugin-store';
import { createContext, useEffect, useState } from 'react';

type AuthContextType = {
    isAuthenticated: boolean;
    loading: boolean;
    login: (username: string) => Promise<void>;
    logout: () => Promise<void>;
};

export type AuthData = {
    isValid: boolean;
    username?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider(props: { store?: Store; children: any }) {
    let { store, children } = props;

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // On app load, read auth status from secure storage
    useEffect(() => {
        async function setupAuthStore() {
            let auth = await store?.get<AuthData>('authenticated');
            setIsAuthenticated(auth?.isValid === true);
            setLoading(false);
        }
        setupAuthStore();
    }, [store]);

    const login = async (username: string) => {
        store?.set('authenticated', { isValid: true, username });
        setIsAuthenticated(true);
        console.debug('Auth token set');
    };

    const logout = async () => {
        store?.set('authenticated', { isValid: false, username: null });
        setIsAuthenticated(false);
        console.debug('Auth token unset');
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, loading, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/** Gets the authentication data (username and validity). */
export async function getAuthData(store?: Store) {
    return await store?.get<AuthData>('authenticated');
}
