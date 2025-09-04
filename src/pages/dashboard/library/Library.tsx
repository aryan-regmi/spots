import { loadMusicLibrary, streamTracks } from '@/api/music';
import { firstRunAtom } from '@/pages/signup/SignupPage';
import { authContextAtom } from '@/utils/auth/atoms';
import StreamedTrackMetadata from '@/utils/music/trackMetadata';
import { Card, List, ListItemButton, Typography } from '@mui/material';
import { listen } from '@tauri-apps/api/event';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';

/* State atoms */
const allTracksAtom = atom<StreamedTrackMetadata[]>([]);
const isStreamingTracksAtom = atom(false);
const displayAllSongsAtom = atom(false);

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
    const [allTracks, setAllTracks] = useAtom(allTracksAtom);
    const [firstRun, setFirstRun] = useAtom(firstRunAtom);
    const [isStreamingTracks, setIsStreamingTracks] = useAtom(
        isStreamingTracksAtom
    );
    const [displayAllSongs, setDisplayAllSongs] = useAtom(displayAllSongsAtom);

    useEffect(() => {
        // Reset songs display
        setDisplayAllSongs(false);

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
                if (firstRun) {
                    await loadMusicLibrary(authUser); // loads and emits each track
                    setFirstRun(false);
                }

                // Always call this to emit existing tracks
                await streamTracks();
            };
            loadAndStream();
        }

        return () => {
            unlistenTrackStream?.then((off) => off());
            unlistenTrackStreamStopped?.then((off) => off());
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

            <div hidden={displayAllSongs}>
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
