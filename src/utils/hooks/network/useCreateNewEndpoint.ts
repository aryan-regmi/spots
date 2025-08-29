import { createNewEndpoint } from '@/api/network';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** Creates a new network endpoint for the user. */
export default function useCreateNewEndpoint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createNewEndpoint,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['get-endpoint-addr'] }),
    });
}
