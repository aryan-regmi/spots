DROP TABLE tracks;

CREATE TABLE IF NOT EXISTS tracks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  network_id INTEGER,
  title TEXT,
  artist TEXT,
  album TEXT,
  genre TEXT,
  year INTEGER,
  cover_base64 TEXT,
  path TEXT UNIQUE NOT NULL,
  FOREIGN KEY (network_id) REFERENCES network(id) ON DELETE SET NULL
)
