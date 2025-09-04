import { invoke } from '@tauri-apps/api/core';
import { User } from '@/api/users';

/** Gets the authenticated user from the database. */
export async function getAuthUser() {
    try {
        let authUser = await invoke<User | null>('get_auth_user');
        return authUser;
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Sets the authenticated user. */
export async function setAuthUser(username: string) {
    try {
        await invoke('set_auth_user', { username });
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Removes/unsets the authenticated user. */
export async function removeAuthUser() {
    try {
        await invoke('remove_auth_user');
    } catch (e: any) {
        throw new Error(e);
    }
}
