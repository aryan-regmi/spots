import { invoke } from '@tauri-apps/api/core';

/** The user type returned by the database. */
export type User = {
    id: number;
    username: string;
};

/** Gets all users from the database. */
export async function getUsers() {
    try {
        let users = await invoke<User[]>('get_users');
        return users;
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Gets the specified user from the database. */
export async function getUser(username: string) {
    try {
        let user = await invoke<User | null>('get_user', { username });
        return user;
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Inserts the given user into the database, and returns the id of the inserted record. */
export async function insertUser(username: string, password: string) {
    try {
        let insertedUserId = await invoke<number>('insert_user', {
            username,
            password,
        });
        return insertedUserId;
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Hashes the given password. */
export async function hashPassword(password: string) {
    try {
        return await invoke<string>('hash_password', { password });
    } catch (e: any) {
        throw new Error(e);
    }
}

/**
 * Checks that the provided password is the same as the hash stored in the
 * database for the specified username.
 **/
export async function verifyPassword(username: string, password: string) {
    try {
        return await invoke<boolean>('verify_password', { username, password });
    } catch (e: any) {
        throw new Error(e);
    }
}
