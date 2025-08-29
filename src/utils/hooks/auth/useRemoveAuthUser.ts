import { removeAuthUser } from '@/api/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** Removes/unsets the authenticated user from the database. */
export default function useRemoveAuthUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: removeAuthUser,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['get-auth'] }),
    });
}
