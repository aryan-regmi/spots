import Database from '@tauri-apps/plugin-sql';
import { useEffect, useState } from 'react';

/** Loads the specifed sqlite database. */
export function loadDatabase(dbName: string) {
    const [db, setDb] = useState<Database | null>(null);
    useEffect(() => {
        const loadDb = async () => {
            setDb(await Database.load(`sqlite:${dbName}`));
        };
        if (db == null) {
            loadDb();
            console.info('Database loaded!');
        }
    }, []);
    return db;
}

/** Checks if the username exists in the database. */
export async function usernameExists(db: Database, username: string) {
    const foundIds = await db.select<any[]>(
        `SELECT id FROM users WHERE username = $1`,
        [username]
    );
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
    return dbPassword[0].password === password;
}
