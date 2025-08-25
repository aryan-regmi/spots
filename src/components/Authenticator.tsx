import { createContext } from 'react';
import {
    useAuthUser,
    useSetAuthUser,
    useUnsetAuthUser,
} from '../hooks/useDatabase';

type AuthContextType = {
    isAuthenticated: boolean;
    isLoading: boolean;
    authorize: (username: string) => Promise<void>;
    unauthorize: () => Promise<void>;
    currentUser?: string;
};

export type AuthData = {
    username?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider(props: { children: any }) {
    let { children } = props;

    const { data: authUser, isLoading } = useAuthUser();
    const { mutateAsync: setAuthUser } = useSetAuthUser();
    const { mutateAsync: unsetAuthUser } = useUnsetAuthUser();

    const isAuthenticated = !isLoading && Boolean(authUser?.username);
    const currentUser = authUser?.username;

    const authorize = async (username: string) => {
        try {
            await setAuthUser({ username });
            console.debug('Auth user set to', username);
        } catch (error) {
            console.error('Error setting auth user:', error);
        }
    };

    const unauthorize = async () => {
        try {
            await unsetAuthUser();
            console.debug('Auth user unset');
        } catch (error) {
            console.error('Error unsetting auth user:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                authorize,
                unauthorize,
                currentUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
