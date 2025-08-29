import { setAuthUser } from '@/api/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** Sets the authenticated user from the database. */
export default function useSetAuthUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: setAuthUser,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['get-auth'] }),
    });
}
