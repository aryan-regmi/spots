import Database from '@tauri-apps/plugin-sql';

/** Checks if the username exists in the database. */
export async function usernameExists(db: Database, username: string) {
    const foundIds = await db.select<any[]>(
        `SELECT id FROM users WHERE username = $1`,
        [username]
    );
    return foundIds.length > 0;
}
