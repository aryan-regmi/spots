import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeAuthUser } from '../../../api/auth';

/** Removes/unsets the authenticated user from the database. */
export default function useRemoveAuthUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: removeAuthUser,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['get-auth'] }),
    });
}
