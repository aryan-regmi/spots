import { streamPlaylistTracks } from '@/api/music';
import Container from '@/components/Container';
import Glassy from '@/components/glassy/Glassy';
import Loading from '@/components/loading/Loading';
import { authContextAtom } from '@/utils/auth/atoms';
import useTransitionNavigate from '@/utils/hooks/useTransitionNavigate';
import StreamedTrackMetadata from '@/utils/music/types/trackMetadata';
import { ArrowBack } from '@mui/icons-material';
import {
    Card,
    CSSProperties,
    IconButton,
    List,
    ListItemButton,
    Stack,
    styled,
    Typography,
} from '@mui/material';
import { listen } from '@tauri-apps/api/event';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function PlaylistPage() {
    const { isLoading, authUser } = useAtomValue(authContextAtom);
    const {
        createdBy,
        playlistId,
        playlistName: encodedPlaylistName,
    } = useParams();
    const playlistName = decodeURIComponent(
        encodedPlaylistName ?? `Playlist #${playlistId}`
    );
    const transitionNav = useTransitionNavigate();
    const [_isStreamingTracks, setIsStreamingTracks] = useState(false);

    /// All of the tracks belonging to the playlist.
    const [tracks, setTracks] = useState<StreamedTrackMetadata[]>([]);

    const id = playlistId ? parseInt(playlistId) : null;

    useEffect(() => {
        let unlistenTrackStream: Promise<() => void>;
        let unlistenTrackStreamStopped: Promise<() => void>;

        // Setup listeners
        function setupListeners() {
            unlistenTrackStream = listen<StreamedTrackMetadata>(
                'playlist-track-stream',
                (event) => {
                    // Deduplicate tracks
                    setTracks((prev) => {
                        return Array.from(
                            new Map(
                                [...prev, event.payload].map((track) => [
                                    track.id,
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

        // Gets the tracks.
        async function getTracks(id: number) {
            await streamPlaylistTracks(id);
        }

        if (authUser) {
            setupListeners();
            setIsStreamingTracks(true);

            if (id && id > 0) {
                getTracks(id);
            }

            return () => {
                // Stop listeners
                unlistenTrackStream?.then((off) => off());
                unlistenTrackStreamStopped?.then((off) => off());
            };
        }
    }, [authUser]);

    if (isLoading) {
        return <Loading />;
    }

    if (id && id > 0) {
        return (
            <Container direction="column" style={{ color: 'white' }}>
                <IconButton
                    sx={backBtnStyle}
                    onClick={() => transitionNav(-1)}
                    size="large"
                >
                    <ArrowBack />
                </IconButton>

                <Stack direction={'row'} justifyContent={'center'}>
                    <Stack
                        direction="column"
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        spacing={'1em'}
                    >
                        <img
                            src={`/default_track.png`}
                            alt={`${playlistName} cover image`}
                            style={{ width: '75%', borderRadius: '1em' }}
                        />
                        <Typography variant="h5">{playlistName}</Typography>
                        {authUser ? (
                            <Typography>By {createdBy ?? 'Unknown'}</Typography>
                        ) : null}

                        <List style={{ padding: 0 }}>
                            {tracks.map((track) => {
                                const metadata = track.metadata;
                                const title =
                                    metadata.title ?? `Track #${track.id}`;

                                // Extract image src
                                const splits = metadata.coverBase64?.split('.');
                                const imgExt = splits
                                    ? splits[splits.length - 1]
                                    : 'png';
                                const mimeType = `image/${imgExt}`;
                                const imgSrc = metadata.coverBase64
                                    ? `data:${mimeType};base64,${metadata.coverBase64}`
                                    : '/default_track.png';

                                return (
                                    <Card
                                        key={track.id}
                                        style={{
                                            padding: 0,
                                            width: '100%',
                                            borderRadius: '1em',
                                            backgroundColor: '#1f1f1f',
                                        }}
                                    >
                                        <GlassyListButton>
                                            <TrackContent
                                                id={track.id}
                                                title={title}
                                                imgSrc={imgSrc}
                                            />
                                        </GlassyListButton>
                                    </Card>
                                );
                            })}
                        </List>
                    </Stack>
                </Stack>
            </Container>
        );
    }
}

const backBtnStyle: CSSProperties = {
    width: 'fit-content',
    marginBottom: '-3.5em',
    fontSize: 'large',
    color: 'white',
    marginLeft: '-0.5em',
};

const GlassyListButton = Glassy(
    styled(ListItemButton)({
        color: 'white',
        padding: 0,
        width: '100%',
    })
);

function TrackContent(props: { id: number; title?: string; imgSrc: string }) {
    const { id, title, imgSrc } = props;
    const CardInner = styled(Stack)({
        width: '100%',
        alignItems: 'center',
        gap: '1em',
    });
    return (
        <CardInner direction={'row'}>
            <img
                src={imgSrc}
                alt={`${title} cover image`}
                style={{
                    width: '20%',
                    height: 'auto',
                    aspectRatio: 1,
                    boxShadow: 'none',
                }}
            />
            <Typography>{title ?? `Track #${id}`}</Typography>
        </CardInner>
    );
}
