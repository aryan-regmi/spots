import { invoke } from '@tauri-apps/api/core';

/** Creates a network endpoint for the user. */
export async function createNetworkEndpoint(username: string) {
    try {
        await invoke('create_new_endpoint', { username });
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Loads the previously created network endpoint for the user. */
export async function loadNetworkEndpoint(username: string) {
    try {
        await invoke('load_endpoint', { username });
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Gets the endpoint address for the user. */
export async function getEndpointAddr(username: string) {
    try {
        return await invoke<string>('get_endpoint_addr', { username });
    } catch (e: any) {
        throw new Error(e);
    }
}
