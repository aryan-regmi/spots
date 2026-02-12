CREATE TABLE users(
    id TEXT PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    salt TEXT NOT NULL,
    is_auth BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);
-- Enforce only one auth user at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_auth_true
ON auth_settings(is_auth)
WHERE
    is_auth = 1;
