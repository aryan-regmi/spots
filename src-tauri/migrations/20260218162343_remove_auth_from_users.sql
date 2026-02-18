-- Drop old users table
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
    id TEXT PRIMARY KEY NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
