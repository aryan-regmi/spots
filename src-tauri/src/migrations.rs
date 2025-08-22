use tauri_plugin_sql::{Migration, MigrationKind};

pub fn migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create users table",
            sql: "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "removed passwords",
            sql: "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "new table",
            sql: "DROP TABLE users; CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "clear everything",
            sql: "DROP TABLE users;",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "Read password",
            sql: "
                CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS auth_user (key TEXT PRIMARY KEY, username TEXT);
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "Enabled foreign keys and added auth_user table",
            sql: "
                PRAGMA foreign_keys = ON;
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    password TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS auth_user (
                    username TEXT PRIMARY KEY,
                    FOREIGN KEY(username) REFERENCES users(username) ON DELETE SET NULL
                );
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "clear auth_user",
            sql: "DROP TABLE auth_user;",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
            description: "Enabled foreign keys and added auth_user table",
            sql: "
                PRAGMA foreign_keys = ON;
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    password TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS auth (
                    username TEXT PRIMARY KEY,
                    is_valid INTEGER NOT NULL
                    FOREIGN KEY(username) REFERENCES users(username) ON DELETE SET NULL
                );
            ",
            kind: MigrationKind::Up,
        },
    ]
}
