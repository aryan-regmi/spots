import { getUser, insertUser, UserId } from '@/api/users';
import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';
import { queryClient } from '../queryClient';

/** Gets the specfied user from the database. */
export const getUserAtom = (userId: UserId) => {
    return atomWithQuery(() => ({
        queryKey: ['getUser', userId],
        queryFn: ({ queryKey: [, userId] }) => getUser(userId as UserId),
        enabled: !!userId, // Prevent calling with empty username
    }));
};

/** Inserts the given user into the database, and returns the id of the inserted
 * record. */
export const insertUserAtom = atomWithMutation(() => ({
    mutationKey: ['insertUser'],
    mutationFn: (props: { username: string; password: string }) =>
        insertUser(props.username, props.password),
    onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['getUsers', 'getUser'] }),
}));
