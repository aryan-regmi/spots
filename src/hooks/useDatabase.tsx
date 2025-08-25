import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getAuthUser,
    getUsers,
    insertUser,
    removeAuthUser,
    setAuthUser,
    User,
} from '../services/api/database';

/** Gets the users from the database. */
export function useGetUsers() {
    return useQuery({
        queryKey: ['usersData'],
        queryFn: getUsers,
    });
}

/** Adds the user to the database. */
export function useAddUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: insertUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['usersData'] });
        },
    });
}

/** Gets the authenticated user from the database. */
export function useAuthUser() {
    return useQuery({
        queryKey: ['authUserData'],
        queryFn: getAuthUser,
    });
}

/** Sets the authenticated user in the database. */
export function useSetAuthUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: setAuthUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['authUserData'] });
        },
    });
}

/** Unsets the authenticated user. */
export function useUnsetAuthUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: removeAuthUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['authUserData'] });
        },
    });
}
