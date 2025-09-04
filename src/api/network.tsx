import { invoke } from '@tauri-apps/api/core';

/** Creates a new network endpoint for the user. */
export async function createEndpoint(userId: number) {
    try {
        await invoke('create_new_endpoint', { userId });
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Loads the stored endpoint for the user. */
export async function loadEndpoint(userId: number) {
    try {
        await invoke('load_endpoint', { userId });
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Gets the endpoint address for the specfied user. */
export async function getEndpointAddr(userId: number) {
    try {
        let endpointAddr = await invoke<string | null>('get_endpoint_addr', {
            userId,
        });
        return endpointAddr;
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Closes the endpoint. */
export async function closeEndpoint() {
    try {
        await invoke('close_endpoint');
    } catch (e: any) {
        throw new Error(e);
    }
}
