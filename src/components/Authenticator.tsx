import { createContext, useEffect, useState } from 'react';
import { getRecord, insertRecord, StrongholdVault } from '../utils/stronghold';
import Database from '@tauri-apps/plugin-sql';

type AuthContextType = {
    isAuthenticated: boolean;
    loading: boolean;
    authorize: (username: string) => Promise<void>;
    unauthorize: () => Promise<void>;
    currentUser?: string;
};

export type AuthData = {
    isValid: boolean;
    username?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider(props: {
    vault?: StrongholdVault;
    children: any;
}) {
    let { vault, children } = props;

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<string>();

    // On app load, check if a user is authorized
    useEffect(() => {
        async function initAuthUser() {
            if (vault?.store) {
                const user = await getRecord(vault.store, 'auth-user');

                if (user && user.trim() !== '') {
                    setIsAuthenticated(true);
                    setCurrentUser(user);
                } else {
                    setIsAuthenticated(false);
                    setCurrentUser(undefined);
                }

                setLoading(false);
            }
        }

        initAuthUser();
    }, []);

    const authorize = async (username: string) => {
        if (!vault?.store) return;
        await insertRecord(vault.store, 'auth-user', username);
        setIsAuthenticated(true);
        setCurrentUser(username);
        console.debug('Auth token set');
    };

    const unauthorize = async () => {
        if (!vault?.store) return;
        await insertRecord(vault.store, 'auth-user', '');
        setIsAuthenticated(false);
        setCurrentUser(undefined);
        console.debug('Auth token unset');
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

/** Get the current authentication state manually */
export async function getAuthData(db: Database): Promise<AuthData> {
    /* if (!store) return { isValid: false }; */
    /* const username = await getRecord(store, 'auth-user'); */
    /* let isValid = username !== null && username.trim() !== ''; */
    /* return { */
    /*     isValid, */
    /*     username: isValid ? username! : undefined, */
    /* }; */
}
