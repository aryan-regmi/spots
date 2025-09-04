import { atom } from 'jotai';
import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';
import { getAuthUser, removeAuthUser, setAuthUser } from '@/api/auth';
import { queryClient } from '@/utils/queryClient';

/** The currently authenticated user. */
const authUserAtom = atomWithQuery(() => ({
    queryKey: ['authUser'],
    queryFn: getAuthUser,
}));

/** Determines if the session is authenticated. */
const isAuthenticatedAtom = atom((get) => {
    const authUser = get(authUserAtom);
    return Boolean(authUser?.data?.username);
});

/** Determines if the authentication is loading. */
const isLoadingAtom = atom((get) => {
    const authUserQuery = get(authUserAtom);
    return authUserQuery.isLoading;
});

/** Removes/unsets the authenticated user from the database. */
const removeAuthUserAtom = atomWithMutation(() => ({
    mutationKey: ['removeAuthUser'],
    mutationFn: removeAuthUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['authUser'] }),
}));

/** Sets the authenticated user from the database. */
const setAuthUserAtom = atomWithMutation(() => ({
    mutationKey: ['setAuthUser'],
    mutationFn: setAuthUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['authUser'] }),
}));

/** Gets the authentication context. */
export const authContextAtom = atom((get) => ({
    isAuthenticated: get(isAuthenticatedAtom),
    isLoading: get(isLoadingAtom),
    authUser: get(authUserAtom).data ?? undefined,
}));

/** The functions to authorize/unauthorize a user. */
export const authContextActionAtom = atom((get) => ({
    authorize: async (username: string) => {
        const mutation = get(setAuthUserAtom);
        await mutation.mutateAsync(username);
    },
    unauthorize: async () => {
        const mutation = get(removeAuthUserAtom);
        await mutation.mutateAsync();
    },
}));
