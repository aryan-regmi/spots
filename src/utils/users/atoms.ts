import { getUser, getUsers, insertUser } from '@/api/users';
import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';
import { queryClient } from '../queryClient';

/** Gets the specfied user from the database. */
export const getUserAtom = (username: string) => {
    return atomWithQuery(() => ({
        queryKey: ['getUser', username],
        queryFn: ({ queryKey: [, username] }) => getUser(username),
    }));
};

/** Gets all users from the database. */
export const getAllUsersAtom = atomWithQuery(() => ({
    queryKey: ['getUsers'],
    queryFn: getUsers,
}));

/** Inserts the given user into the database, and returns the id of the inserted
 * record. */
export const insertUserAtom = atomWithMutation(() => ({
    mutationKey: ['insertUser'],
    mutationFn: (props: { username: string; password: string }) =>
        insertUser(props.username, props.password),
    onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['getUsers', 'getUser'] }),
}));
