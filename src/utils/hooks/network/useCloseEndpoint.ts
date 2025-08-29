import { closeEndpoint } from '@/api/network';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** Closes the endpoint. */
export default function useCloseEndpoint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: closeEndpoint,
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['get-endpoint-addr'],
            }),
    });
}
