import Database from '@tauri-apps/plugin-sql';
import { AuthData } from '../components/Authenticator';
import { assert } from './common';

/** Checks if the username exists in the database. */
export async function usernameExists(db: Database, username: string) {
    const foundIds = await db.select<any[]>(
        `SELECT id FROM users WHERE username = $1`,
        [username]
    );
    return foundIds.length > 0;
}

/** Gets the authentication record. */
export async function getAuthRecord(db: Database) {
    const { username } = await db.select<{
        username?: string;
    }>('SELECT username FROM auth LIMIT 1');
    return { authenticatedUser: username };
}

/** Updates the auth data. */
export async function updateAuthRecord(db: Database, data: AuthData) {
    const result = await db.execute(
        `
        UPDATE auth
        SET username = $1,
        WHERE id = 1;
    `,
        [data.username ?? null]
    );
    assert(result.rowsAffected == 1 && result.lastInsertId == 1);
}

/** Insert the username and password into the database. */
export async function insertUserLogin(
    db: Database,
    username: string,
    password: string
) {
    await db.execute('INSERT INTO users (username, password) VALUES ($1, $2)', [
        username,
        password,
    ]);
}

/** Gets the record for the specified user. */
export async function getUserRecord(db: Database, username: string) {
    return await db.select<{ username: string; password: string }>(
        'SELECT username, password FROM users WHERE username = $1 LIMIT 1',
        [username]
    );
}
