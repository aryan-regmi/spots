import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';
import { getUser, insertUser, UserId } from '@/api/users';
import { queryClient } from '@/utils/queryClient';

/** Gets the specfied user from the database. */
export const getUserAtom = (userId: UserId) => {
    const idValue =
        userId?.type === 'id'
            ? userId.value
            : typeof userId?.value === 'string'
              ? userId.value.trim()
              : undefined;

    // Prevents running with empty values
    const enabled =
        userId?.type === 'id'
            ? typeof userId.value === 'number' && !isNaN(userId.value)
            : typeof userId.value === 'string' && userId.value.trim() !== '';

    return atomWithQuery(() => ({
        queryKey: ['getUser', userId.type, idValue],
        enabled: enabled,
        queryFn: () => getUser(userId),
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
