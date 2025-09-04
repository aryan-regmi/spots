import { invoke } from '@tauri-apps/api/core';

/** Loads the music library, and streams the each loaded track.
 *
 * # Note
 * The event emitted is "`track-stream`".
 **/
export async function loadMusicLibrary(userId: number) {
    try {
        await invoke('load_music_library', { userId });
    } catch (e: any) {
        throw new Error(e);
    }
}

/** Streams all the tracks in the library from the database by emitting an event with the metadata.
 *
 * # Note
 * The event emitted is "`track-stream`".
 **/
export async function streamTracks() {
    try {
        await invoke('stream_tracks');
    } catch (e: any) {
        throw new Error(e);
    }
}
