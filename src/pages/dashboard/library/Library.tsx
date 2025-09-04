import { loadMusicLibrary, streamTracks } from '@/api/music';
import { firstRunAtom } from '@/pages/signup/SignupPage';
import { authContextAtom } from '@/utils/auth/atoms';
import StreamedTrackMetadata from '@/utils/music/trackMetadata';
import { Card, List, ListItemButton } from '@mui/material';
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

export default function Library() {
    const { authUser } = useAtomValue(authContextAtom);
    const [allTracks, setAllTracks] = useAtom(allTracksAtom);
    const [firstRun, setFirstRun] = useAtom(firstRunAtom);
    const [isStreamingTracks, setIsStreamingTracks] = useAtom(
        isStreamingTracksAtom
    );
    const [displayAllSongs, setDisplayAllSongs] = useAtom(displayAllSongsAtom);

    useEffect(() => {
        let isMounted = true;

        let unlistenTrackLoaded: Promise<() => void>;
        let unlistenTrackStreamStopped: Promise<() => void>;

        const setupListeners = () => {
            unlistenTrackLoaded = listen<StreamedTrackMetadata>(
                'track-loaded',
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
        };

        if (authUser) {
            setupListeners();
            setIsStreamingTracks(true);

            const loadAndStream = async () => {
                if (firstRun) {
                    await loadMusicLibrary(authUser); // loads and emits each track
                    if (!isMounted) {
                        return;
                    }
                    setFirstRun(false);
                }

                // Always call this to emit existing tracks
                if (!isMounted) {
                    return;
                }
                await streamTracks();
            };
            loadAndStream();
        }

        return () => {
            unlistenTrackLoaded?.then((off) => off());
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
                <ListItemButton onClick={toggleAllSongsDisplay}>
                    <Card>All Songs</Card>
                </ListItemButton>
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
