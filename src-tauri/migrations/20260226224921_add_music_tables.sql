-- Tracks Table
CREATE TABLE tracks (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    album_id TEXT REFERENCES albums(id) ON DELETE SET NULL,
    track_number INTEGER,
    release_year INTEGER,
    duration_secs INTEGER,
    file_path TEXT NOT NULL UNIQUE,
    thumbnail_path TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_played_at TEXT
);


-- Artists Table
CREATE TABLE artists (
    id TEXT PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
);


-- Genres Table
CREATE TABLE genres (
    name TEXT PRIMARY KEY
);


-- Albums Table
CREATE TABLE albums (
    id TEXT PRIMARY KEY NOT NULL,
    title VARCHAR(255) NOT NULL,
    thumbnail_path TEXT NOT NULL,
);


-- Playlists Table
CREATE TABLE playlists (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    thumbnail_path TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_played_at TEXT
);


-- Favorited Tracks Table
CREATE TABLE favorited_tracks (
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    track_id TEXT REFERENCES tracks(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, track_id)
);


-- Track Artists Table
CREATE TABLE track_artists (
    track_id TEXT REFERENCES tracks(id) ON DELETE CASCADE,
    artist_id TEXT REFERENCES artists(id) ON DELETE SET NULL,
    PRIMARY KEY (track_id, artist_id)
);


-- Playlist Tracks (Ordered) Table
CREATE TABLE playlist_tracks (
    playlist_id TEXT REFERENCES playlists(id) ON DELETE CASCADE,
    track_id TEXT REFERENCES tracks(id) ON DELETE CASCADE,
    track_order INTEGER NOT NULL UNIQUE,
    PRIMARY KEY (playlist_id, track_id) 
);


-- Pinned Playlists Table
CREATE TABLE pinned_playlists (
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    playlist_id TEXT REFERENCES playlists(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, playlist_id)
);


-- Track Genres Table
CREATE TABLE track_genres (
    track_id TEXT REFERENCES tracks(id) ON DELETE CASCADE,
    genre TEXT REFERENCES genres(name) ON DELETE SET NULL,
    PRIMARY KEY (track_id, genre)
);
