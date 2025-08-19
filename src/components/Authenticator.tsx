import { createContext, useContext, useEffect, useState } from 'react';
import { load, Store } from '@tauri-apps/plugin-store';

type AuthContextType = {
    username: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
};

type AuthData = {
    isValid: boolean;
    username?: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider(props: { store: Store | null; children: any }) {
    let { store, children } = props;

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState<string | null>(null);

    // On app load, read auth status from secure storage
    useEffect(() => {
        async function setupAuthStore() {
            if (store == null) {
                store = await load('store.json');
            }
            let auth = await store.get<AuthData>('authenticated');
            setIsAuthenticated(auth?.isValid === true);
            setUsername(auth?.username ?? null);
            setLoading(false);
        }
        setupAuthStore();
    }, []);

    const login = async () => {
        store?.set('authenticated', { isValid: true, username });
        setIsAuthenticated(true);
        console.debug('Auth token set');
    };

    const logout = async () => {
        store?.set('authenticated', { isValid: false });
        setIsAuthenticated(false);
        console.debug('Auth token unset');
    };

    return (
        <AuthContext.Provider
            value={{ username, isAuthenticated, loading, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}

export async function getAuthValid(store: Store | null) {
    let auth = await store?.get<AuthData>('authenticated');
    return auth?.isValid;
}

export async function getAuthUsername(store: Store | null) {
    let auth = await store?.get<AuthData>('authenticated');
    if (auth?.isValid) {
        return auth.username;
    }
}
