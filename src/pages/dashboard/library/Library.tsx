import { loadMusicLibrary, streamPlaylists } from '@/api/music';
import Glassy from '@/components/glassy/Glassy';
import { isFirstLoginAtom } from '@/pages/signup/SignupPage';
import { authContextAtom } from '@/utils/auth/atoms';
import useTransitionNavigate from '@/utils/hooks/useTransitionNavigate';
import StreamedPlaylistMetadata from '@/utils/music/types/playlistMetadata';
import {
    Card,
    List,
    ListItemButton,
    Stack,
    styled,
    Typography,
} from '@mui/material';
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
    const transitionNavigate = useTransitionNavigate();
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
        <List style={{ padding: 0 }}>
            {playlists.map((playlist) => {
                const metadata = playlist.metadata;
                return (
                    <PlaylistCard key={playlist.id}>
                        <GlassyListButton
                            onClick={() =>
                                transitionNavigate(`/playlist/${playlist.id}`)
                            }
                        >
                            <PlaylistContent
                                id={playlist.id}
                                name={metadata.name}
                            />
                        </GlassyListButton>
                    </PlaylistCard>
                );
            })}
        </List>
    );
}

const PlaylistCard = styled(Card)({
    borderRadius: '0.5em',
    backgroundColor: '#1f1f1f',
});

const GlassyListButton = Glassy(
    styled(ListItemButton)({
        color: 'white',
        padding: 0,
    })
);

const CardInner = styled(Stack)({
    width: '100%',
    alignItems: 'center',
    gap: '1em',
});

function PlaylistContent(props: { id: number; name?: string }) {
    const { id, name } = props;
    return (
        <CardInner direction={'row'}>
            <img
                src={`/default_track.png`}
                alt={`${name} cover image`}
                style={{ width: '25%' }}
            />
            <Typography>{name ?? `Playlist #${id}`}</Typography>
        </CardInner>
    );
}
