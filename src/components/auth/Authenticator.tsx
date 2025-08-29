import Loading from '@/components/loading/Loading';
import useGetAuthUser from '@/utils/hooks/auth/useGetAuthUser';
import useRemoveAuthUser from '@/utils/hooks/auth/useRemoveAuthUser';
import useSetAuthUser from '@/utils/hooks/auth/useSetAuthUser';
import { AuthContext } from '@/components/auth/AuthContext';

export type AuthData = {
    username?: string;
};

export function AuthProvider(props: { children: any }) {
    const { children } = props;
    const { data: authUser, isLoading } = useGetAuthUser();
    const removeAuthUser = useRemoveAuthUser();
    const setAuthUser = useSetAuthUser();
    const isAuthenticated = !isLoading && Boolean(authUser);

    if (isLoading) {
        return <Loading />;
    }

    async function authorize(username: string) {
        try {
            await setAuthUser.mutateAsync(username);
            console.info('Authenticated user:', username);
        } catch (e: any) {
            throw new Error(e);
        }
    }

    async function unauthorize() {
        try {
            await removeAuthUser.mutateAsync();
            console.info('Unauthenticated user:', authUser);
        } catch (e: any) {
            throw new Error(e);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                currentUser: authUser?.username ?? undefined,
                authorize,
                unauthorize,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
