import Database from '@tauri-apps/plugin-sql';
import { useEffect, useState } from 'react';

/** Loads the specifed sqlite database. */
export default function useDatabase(dbName: string) {
    const [db, setDb] = useState<Database>();
    useEffect(() => {
        const loadDb = async () => {
            setDb(await Database.load(`sqlite:${dbName}`));
        };
        loadDb();
        console.info(`Database loaded: ${dbName}`);
    }, [dbName]);
    return db;
}
