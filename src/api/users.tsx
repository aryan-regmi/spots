import { invoke } from '@tauri-apps/api/core';

/** The user type returned by the database. */
export type User = {
    id: number;
    username: string;
};

/** Represents a user identifier. */
export type UserId =
    | { type: 'id'; value: number }
    | { type: 'username'; value: string };

/** Gets the specified user from the database. */
export async function getUser(userId: UserId) {
    try {
        let user = await invoke<User | null>('get_user', { user_id: userId });
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
export async function verifyPassword(userId: number, password: string) {
    try {
        return await invoke<boolean>('verify_password', {
            user_id: userId,
            password,
        });
    } catch (e: any) {
        throw new Error(e);
    }
}
