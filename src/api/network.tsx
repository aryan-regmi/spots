import { invoke } from '@tauri-apps/api/core';

/** Creates a new network endpoint for the user. */
export async function createEndpoint(username: string) {
    try {
        await invoke('create_new_endpoint', { username });
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Loads the stored endpoint for the user. */
export async function loadEndpoint(username: string) {
    try {
        await invoke('load_endpoint', { username });
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Gets the endpoint address for the specfied user. */
export async function getEndpointAddr(username: string) {
    try {
        let endpointAddr = await invoke<string | null>('get_endpoint_addr', {
            username,
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
