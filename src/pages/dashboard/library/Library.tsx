import { loadMusicLibrary, streamTracks } from '@/api/music';
import { firstRunAtom } from '@/pages/signup/SignupPage';
import { authContextAtom } from '@/utils/auth/atoms';
import TrackMetadata from '@/utils/music/trackMetadata';
import { List, ListItemButton } from '@mui/material';
import { listen } from '@tauri-apps/api/event';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';

/* State atoms */
const allTracksAtom = atom<TrackMetadata[]>([]);
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
        const stopTrackLoadedListener = listen('track-loaded', (event) => {
            const newTrack = event.payload as TrackMetadata;
            setAllTracks((prev) => [...prev, newTrack]);
        });
        const stopTrackStreamStoppedListener = listen(
            'track-stream-stopped',
            (_) => {
                setIsStreamingTracks(false);
            }
        );

        setIsStreamingTracks(true);
        if (firstRun && authUser) {
            loadMusicLibrary(authUser).then(() => setFirstRun(false));
        } else {
            streamTracks();
        }

        return () => {
            stopTrackLoadedListener.then((off) => off());
            stopTrackStreamStoppedListener.then((off) => off());
        };
    }, []);

    return (
        <>
            {/* TODO: Display all playlists/albums here */}
            <List style={{ color: 'white' }}>
                {allTracks.map((track) => {
                    return (
                        <ListItemButton>
                            {track.title ?? 'Unknown!'}
                        </ListItemButton>
                    );
                })}
                {/* <ListItemButton title="All Songs"></ListItemButton> */}
            </List>
            <div>Hello</div>
        </>
    );
}
