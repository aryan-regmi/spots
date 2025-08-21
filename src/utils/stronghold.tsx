import { Client, Store, Stronghold } from '@tauri-apps/plugin-stronghold';
import { appDataDir } from '@tauri-apps/api/path';

export type StrongholdVault = { stronghold: Stronghold; store: Store };

/** Initalizes the stronghold. */
export async function initStronghold(
    vaultPassword: string
): Promise<StrongholdVault> {
    const vaultPath = `${await appDataDir()}/vault.hold`;
    const stronghold = await Stronghold.load(vaultPath, vaultPassword);

    const clientName = 'auth-client';
    let client: Client;
    try {
        client = await stronghold.loadClient(clientName);
    } catch {
        client = await stronghold.createClient(clientName);
    }

    const store = client.getStore();
    console.info('Vault created.');
    return { stronghold, store };
}

/** Insert a record into the store. */
export async function insertRecord(store: Store, key: string, value: string) {
    const data = Array.from(new TextEncoder().encode(value));
    await store.insert(key, data);
}

/** Read a record from the store. */
export async function getRecord(store: Store, key: string) {
    const data = await store.get(key);
    return data ? new TextDecoder().decode(new Uint8Array(data)) : null;
}
