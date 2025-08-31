import {
    closeEndpoint,
    createEndpoint,
    getEndpointAddr,
    loadEndpoint,
} from '@/api/network';
import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';
import { queryClient } from '../queryClient';

/** Gets the endpoint address for the user. */
export const getEndpointAddressAtom = (username: string) => {
    return atomWithQuery(() => ({
        queryKey: ['endpointAddr', username],
        queryFn: ({ queryKey: [, username] }) => getEndpointAddr(username),
        enabled: !!username, // Prevent calling with empty username
    }));
};

/** Creates a new network endpoint for the user. */
export const createEndpointAtom = atomWithMutation(() => ({
    mutationKey: ['createEndpoint'],
    mutationFn: createEndpoint,
    onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['endpointAddr'] }),
}));

/** Loads the stored endpoint for the user. */
export const loadEndpointAtom = atomWithMutation(() => ({
    mutationKey: ['loadEndpoint'],
    mutationFn: loadEndpoint,
    onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['endpointAddr'] }),
}));

/** Closes the endpoint. */
export const closeEndpointAtom = atomWithMutation(() => ({
    mutationKey: ['closeEndpoint'],
    mutationFn: closeEndpoint,
    onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['endpointAddr'] }),
}));
