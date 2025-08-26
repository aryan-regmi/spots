import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    closeEndpoint,
    createNetworkEndpoint,
    getEndpointAddr,
    loadNetworkEndpoint,
} from '../services/api/network';

/** Gets the endpoint address for the user. */
export function useGetEndpointAddr(username: string) {
    return useQuery({
        queryKey: ['networkData', username],
        queryFn: ({ queryKey }) => {
            return getEndpointAddr(queryKey[1]);
        },
    });
}

/** Creates a network endpoint for the user. */
export function useCreateNetworkEndpoint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createNetworkEndpoint,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['networkData'] }),
    });
}

/** Loads the previously created network endpoint for the user. */
export function useLoadNetworkEndpoint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: loadNetworkEndpoint,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['networkData'] }),
    });
}

export function useCloseNetworkEndpoint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: closeEndpoint,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['networkData'] }),
    });
}
