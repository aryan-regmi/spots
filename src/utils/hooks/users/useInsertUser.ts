import { insertUser } from '@/api/users';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** Inserts the given user into the database, and returns the id of the inserted
 * record. */
export default function useInsertUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (props: { username: string; password: string }) =>
            insertUser(props.username, props.password),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['get-user', 'get-users'],
            }),
    });
}
