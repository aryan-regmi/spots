import Database from '@tauri-apps/plugin-sql';

/** Checks if the username exists in the database. */
export async function usernameExists(db: Database, username: string) {
    const foundIds = await db.select<any[]>(
        `SELECT id FROM users WHERE username = $1`,
        [username]
    );
    console.log(foundIds);
    return foundIds.length > 0;
}

/** Checks if the password is correct for the specifed username. */
export async function passwordIsCorrect(
    db: Database,
    username: string,
    password: string
) {
    const dbPassword = await db.select<{ password: string }[]>(
        `SELECT password FROM users WHERE username = $1 LIMIT 1`,
        [username]
    );
    console.log(
        `${dbPassword[0].password}: ${password} ==> ${dbPassword[0].password === password}`
    );
    return dbPassword[0].password === password;
}
