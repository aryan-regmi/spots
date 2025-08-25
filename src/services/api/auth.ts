import { invoke } from '@tauri-apps/api/core';

/** Hashes the given password. */
export async function hashPassword(password: string): Promise<string> {
    try {
        return await invoke('hash_password', { password });
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Checks that the provided password is the same as the hash stored in the database. */
export async function verifyPassword(
    username: string,
    password: string
): Promise<boolean> {
    try {
        return await invoke('verify_password', { username, password });
    } catch (e: any) {
        throw new Error(e);
    }
}
