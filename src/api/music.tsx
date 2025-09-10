import { invoke } from '@tauri-apps/api/core';

/** Loads the music library, and streams the each loaded track.
 *
 * # Note
 * * Emits `track-stream` event for each loaded track.
 **/
export async function loadMusicLibrary(userId: number) {
    try {
        await invoke('load_music_library', { userId });
    } catch (e: any) {
        throw new Error(e);
    }
}

// FIXME: Remove and replace calls with stream_playlist_tracks
//
/** Streams all the tracks in the library from the database by emitting an event with the metadata.
 *
 * # Note
 * * Emits `track-stream` event for each track.
 * * Emits `track-stream-stopped` event once stream is finished.
 **/
export async function streamAllTracks() {
    try {
        await invoke('stream_all_tracks');
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Streams all the playlists in the user's library.
 *
 * # Note
 * * Emits `playlist-stream` event for each playlist.
 * * Emits `playlist-stream-stopped` event once stream is finished.
 **/
export async function streamPlaylists(userId: number) {
    try {
        await invoke('stream_playlists', { userId });
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Streams all the tracks in the specified playlist.
 *
 * # Note
 * * Emits `playlist-track-stream` event for each track.
 * * Emits `playlist-track-stream-stopped` event once stream is finished.
 **/
export async function streamPlaylistTracks(playlistId: number) {
    try {
        await invoke('stream_playlist_tracks', { playlistId });
    } catch (e: any) {
        throw new Error(e);
    }
}
