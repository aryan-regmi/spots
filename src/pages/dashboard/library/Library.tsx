import {
    loadMusicLibrary,
    streamAllTracks,
    streamPlaylists,
} from '@/api/music';
import { isFirstLoginAtom } from '@/pages/signup/SignupPage';
import { authContextAtom } from '@/utils/auth/atoms';
import StreamedPlaylistMetadata from '@/utils/music/types/playlistMetadata';
import StreamedTrackMetadata from '@/utils/music/types/trackMetadata';
import { Card, List, ListItemButton, Typography } from '@mui/material';
import { listen } from '@tauri-apps/api/event';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';

// TODO: Add refresh button that will call `loadMusicLibrary`
//
// TODO: Show skeleton when `isStreamingTracks`
//
// TODO: Create `All Songs` playlist in the backend
//  - Populate it with all the loaded songs.
//  - Add command in backend to stream playlists, instead of directly streaming songs
//  - Playlist code will stream songs

export default function Library() {
    const { authUser } = useAtomValue(authContextAtom);
    const [playlists, setPlaylists] = useState<StreamedPlaylistMetadata[]>([]);
    const [isFirstLogin, setIsFirstLogin] = useAtom(isFirstLoginAtom);
    const [_isStreamingPlaylists, setIsStreamingPlaylists] = useState(false);

    useEffect(() => {
        let unlistenPlaylistStream: Promise<() => void>;
        let unlistenPlaylistStreamStopped: Promise<() => void>;

        /** Sets up listeners.  */
        function setupListeners() {
            unlistenPlaylistStream = listen<StreamedPlaylistMetadata>(
                'playlist-stream',
                (event) => {
                    // Deduplicate playlists
                    setPlaylists((prev) => {
                        return Array.from(
                            new Map(
                                [...prev, event.payload].map((playlist) => [
                                    playlist.id,
                                    playlist,
                                ])
                            ).values()
                        );
                    });
                }
            );

            unlistenPlaylistStreamStopped = listen(
                'playlist-stream-stopped',
                (_) => {
                    setIsStreamingPlaylists(false);
                }
            );
        }

        if (authUser) {
            setupListeners();
            setIsStreamingPlaylists(true);

            const loadAndStream = async () => {
                // Load music library on first login
                if (isFirstLogin) {
                    await loadMusicLibrary(authUser.id);
                    setIsFirstLogin(false);
                }

                // Always call this to stream existing playlists
                await streamPlaylists(authUser.id);
            };
            loadAndStream();
        }

        return () => {
            // Stop listeners
            unlistenPlaylistStream?.then((off) => off());
            unlistenPlaylistStreamStopped?.then((off) => off());
        };
    }, []);

    return (
        <>
            <List>
                {playlists.map((playlist) => {
                    const metadata = playlist.metadata;
                    return (
                        <Card>
                            <ListItemButton key={playlist.id}>
                                <Typography>
                                    {metadata.name ??
                                        `Playlist #${playlist.id}`}
                                </Typography>
                            </ListItemButton>
                        </Card>
                    );
                })}
            </List>
        </>
    );
}
