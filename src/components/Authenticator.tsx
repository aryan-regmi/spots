import React, { createContext, useContext, useEffect, useState } from 'react';
import { load, Store } from '@tauri-apps/plugin-store';

type AuthContextType = {
    isAuthenticated: boolean;
    loading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [store, setStore] = useState<Store | null>(null);

    // On app load, read auth status from secure storage
    useEffect(() => {
        load('store.json').then((store) => {
            setStore(store);

            store
                .get<boolean>('authenticated')
                .then((value) => setIsAuthenticated(value === true))
                .finally(() => setLoading(false));
        });
    }, []);

    const login = async () => {
        store?.set('authenticated', true);
        setIsAuthenticated(true);
        console.debug('Auth token set');
    };

    const logout = async () => {
        store?.set('authenticated', false);
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
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
