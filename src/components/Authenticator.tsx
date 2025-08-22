import { createContext, useEffect, useState } from 'react';
import Database from '@tauri-apps/plugin-sql';
import { getAuthRecord, updateAuthRecord } from '../utils/sql';

type AuthContextType = {
    isAuthenticated: boolean;
    loading: boolean;
    authorize: (username: string) => Promise<void>;
    unauthorize: () => Promise<void>;
    currentUser?: string;
};

export type AuthData = {
    username?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider(props: { db?: Database; children: any }) {
    const { db, children } = props;

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<string>();

    // On app load, check if a user is authorized
    useEffect(() => {
        async function initAuthUser() {
            if (db) {
                const { authenticatedUser } = await getAuthRecord(db);
                setIsAuthenticated(authenticatedUser !== undefined);
                setCurrentUser(authenticatedUser);
                setLoading(false);
            }
        }

        initAuthUser();
    }, []);

    const authorize = async (username: string) => {
        if (db) {
            await updateAuthRecord(db, { username });
            setIsAuthenticated(true);
            setCurrentUser(username);
            console.debug('Auth token set');
        }
    };

    const unauthorize = async () => {
        if (db) {
            await updateAuthRecord(db, { username: undefined });
            setIsAuthenticated(false);
            setCurrentUser(undefined);
            console.debug('Auth token unset');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                loading,
                authorize,
                unauthorize,
                currentUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
