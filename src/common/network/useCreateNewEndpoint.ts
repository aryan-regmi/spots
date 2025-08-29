import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNewEndpoint } from '../../api/network';

/** Creates a new network endpoint for the user. */
export default function useCreateNewEndpoint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createNewEndpoint,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['get-endpoint-addr'] }),
    });
}
