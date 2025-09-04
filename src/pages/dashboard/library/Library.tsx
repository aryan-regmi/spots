import { loadMusicLibrary, streamTracks } from '@/api/music';
import { firstRunAtom } from '@/pages/signup/SignupPage';
import { authContextAtom } from '@/utils/auth/atoms';
import StreamedTrackMetadata from '@/utils/music/trackMetadata';
import { List, ListItemButton } from '@mui/material';
import { listen } from '@tauri-apps/api/event';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';

/* State atoms */
const allTracksAtom = atom<StreamedTrackMetadata[]>([]);
const isStreamingTracksAtom = atom(false);

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

    useEffect(() => {
        const unlistenTrackLoaded = listen('track-loaded', (event) => {
            const newTrack = event.payload as StreamedTrackMetadata;
            setAllTracks((prev) => {
                // Deduplicate tracks
                let combined = [...prev, newTrack];
                return Array.from(
                    new Map(combined.map((track) => [track.id, track])).values()
                );
            });
        });
        const unlistenTrackStreamStopped = listen(
            'track-stream-stopped',
            (_) => {
                setIsStreamingTracks(false);
                unlistenTrackLoaded.then((off) => off());
            }
        );

        if (firstRun && authUser) {
            loadMusicLibrary(authUser).then(() => setFirstRun(false));
        }
        setIsStreamingTracks(true);
        streamTracks();

        return () => {
            unlistenTrackLoaded.then((off) => off());
            unlistenTrackStreamStopped.then((off) => off());
        };
    }, []);

    return (
        <>
            {/* TODO: Display all playlists/albums here */}
            <List style={{ color: 'white' }}>
                {allTracks.map((track) => {
                    const metadata = track.metadata;
                    return (
                        <ListItemButton>
                            {metadata.title ?? 'Unknown!'}
                        </ListItemButton>
                    );
                })}
                {/* <ListItemButton title="All Songs"></ListItemButton> */}
            </List>
            <div>Hello</div>
        </>
    );
}
