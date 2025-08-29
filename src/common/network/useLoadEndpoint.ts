import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loadEndpoint } from '../../api/network';

/** Loads the stored endpoint for the user. */
export default function useLoadEndpoint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: loadEndpoint,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['get-endpoint-addr'] }),
    });
}
