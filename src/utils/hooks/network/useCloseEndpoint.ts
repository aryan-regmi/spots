import { useMutation, useQueryClient } from '@tanstack/react-query';
import { closeEndpoint } from '../../api/network';

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
