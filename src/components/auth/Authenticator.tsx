import Loading from '../loading/Loading';
import useGetAuthUser from '../../common/hooks/auth/useGetAuthUser';
import useRemoveAuthUser from '../../common/hooks/auth/useRemoveAuthUser';
import useSetAuthUser from '../../common/hooks/auth/useSetAuthUser';
import { AuthContext } from './AuthContext';

export type AuthData = {
    username?: string;
};

export function AuthProvider(props: { children: any }) {
    const { children } = props;
    const { data: authUser, isLoading } = useGetAuthUser();
    const removeAuthUser = useRemoveAuthUser();
    const setAuthUser = useSetAuthUser();
    const isAuthenticated = !isLoading && Boolean(authUser);

    if (!authUser || !authUser.username) {
        return <Loading />;
    }

    async function authorize(username: string) {
        try {
            await setAuthUser.mutateAsync(username);
            console.debug('Authenticated user:', username);
        } catch (e: any) {
            throw new Error(e);
        }
    }

    async function unauthorize() {
        try {
            await removeAuthUser.mutateAsync();
            console.debug('Unauthenticated user:', authUser);
        } catch (e: any) {
            throw new Error(e);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                currentUser: authUser.username,
                authorize,
                unauthorize,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
