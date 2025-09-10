import { loadMusicLibrary, streamAllTracks } from '@/api/music';
import { isFirstLoginAtom } from '@/pages/signup/SignupPage';
import { authContextAtom } from '@/utils/auth/atoms';
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
    const [allTracks, setAllTracks] = useState<StreamedTrackMetadata[]>([]);
    const [isFirstLogin, setIsFirstLogin] = useAtom(isFirstLoginAtom);
    const [_isStreamingTracks, setIsStreamingTracks] = useState(false);
    const [displayAllSongs, setDisplayAllSongs] = useState(false);

    useEffect(() => {
        let unlistenTrackStream: Promise<() => void>;
        let unlistenTrackStreamStopped: Promise<() => void>;

        /** Sets up listeners.  */
        function setupListeners() {
            unlistenTrackStream = listen<StreamedTrackMetadata>(
                'track-stream',
                (event) => {
                    // Deduplicate tracks
                    setAllTracks((prev) => {
                        return Array.from(
                            new Map(
                                [...prev, event.payload].map((track) => [
                                    track.metadata.path,
                                    track,
                                ])
                            ).values()
                        );
                    });
                }
            );

            unlistenTrackStreamStopped = listen('track-stream-stopped', (_) => {
                setIsStreamingTracks(false);
            });
        }

        if (authUser) {
            setupListeners();
            setIsStreamingTracks(true);

            const loadAndStream = async () => {
                // Load music library on first login
                if (isFirstLogin) {
                    await loadMusicLibrary(authUser.id);
                    setIsFirstLogin(false);
                }

                // Always call this to emit existing tracks
                await streamAllTracks();
            };
            loadAndStream();
        }

        return () => {
            // Stop listeners
            unlistenTrackStream?.then((off) => off());
            unlistenTrackStreamStopped?.then((off) => off());

            // Reset songs display
            setDisplayAllSongs(false);
        };
    }, []);

    async function toggleAllSongsDisplay() {
        setDisplayAllSongs(!displayAllSongs);
    }

    return (
        <>
            {/* TODO: Display all playlists/albums here */}
            <List>
                <Card>
                    <ListItemButton onClick={toggleAllSongsDisplay}>
                        <Typography>All Songs</Typography>
                    </ListItemButton>
                </Card>
            </List>

            {/* FIXME: Remove and replace with a separate component!  */}
            <div hidden={!displayAllSongs}>
                Songs:
                <List style={{ color: 'white' }}>
                    {allTracks.map((track) => {
                        const metadata = track.metadata;
                        return (
                            <ListItemButton key={metadata.path}>
                                {metadata.title ?? 'Unknown!'}
                            </ListItemButton>
                        );
                    })}
                    {/* <ListItemButton title="All Songs"></ListItemButton> */}
                </List>
            </div>
        </>
    );
}
