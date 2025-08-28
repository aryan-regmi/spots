import { AuthContext } from './AuthContext';
import { getAuthUser, removeAuthUser, setAuthUser } from '../../api/auth';
import { useEffect, useState } from 'react';

export type AuthData = {
    username?: string;
};

export function AuthProvider(props: { children: any }) {
    const { children } = props;

    const [currentUser, setCurrentUser] = useState<string>();
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        getAuthUser()
            .then((user) => setCurrentUser(user.username ?? undefined))
            .finally(() => setIsLoading(false));
    }, []);
    const isAuthenticated = !isLoading && Boolean(currentUser);

    async function authorize(username: string) {
        try {
            await setAuthUser(username);
            setCurrentUser(username);
            console.debug('Authenticated user:', username);
        } catch (e: any) {
            throw new Error(e);
        }
    }

    async function unauthorize() {
        try {
            await removeAuthUser();
            setCurrentUser(undefined);
            console.debug('Unauthenticated user:', currentUser);
        } catch (e: any) {
            throw new Error(e);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                currentUser,
                authorize,
                unauthorize,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
