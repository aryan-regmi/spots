import { invoke } from '@tauri-apps/api/core';

/** Represents a user in the database. */
export type User = {
    id: number;
    username: string;
};

/** Represents an user in the database. */
export type AuthUser = { username?: string };

/** Gets all users from the database. */
export async function getUsers() {
    try {
        return await invoke<User[]>('get_users');
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Inserts the user to the database. */
export async function insertUser(data: {
    username: string;
    password: string;
}): Promise<User> {
    const { username, password } = data;
    try {
        let insertedId = await invoke<number>('insert_user', {
            username,
            password,
        });
        return { id: insertedId, username };
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Gets the authenticated user. */
export async function getAuthUser(): Promise<AuthUser> {
    try {
        return await invoke('get_auth_user');
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Sets the authenticated user. */
export async function setAuthUser(data: { username: string }) {
    const { username } = data;
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
