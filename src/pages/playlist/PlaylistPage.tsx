import Container from '@/components/Container';
import Glassy from '@/components/glassy/Glassy';
import Loading from '@/components/loading/Loading';
import StreamedTrackMetadata, {
    TrackMetadata,
} from '@/utils/music/types/trackMetadata';
import useTransitionNavigate from '@/utils/hooks/useTransitionNavigate';
import {
    Card,
    IconButton,
    List,
    ListItemButton,
    Stack,
    styled,
    Typography,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { JSX, useEffect, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { authContextAtom } from '@/utils/auth/atoms';
import { listen } from '@tauri-apps/api/event';
import { streamPlaylistTracks } from '@/api/music';
import { useParams } from 'react-router-dom';
import MusicPlayer, { currentTrackAtom } from '@/components/player/MusicPlayer';
import Img from '@/components/Img';

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
    const [_isStreamingTracks, setIsStreamingTracks] = useState(false);
    const setCurrentTrack = useSetAtom(currentTrackAtom);

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
                <BackButton />

                <CenteredContainer spacing="1em">
                    <PlaylistHeaderContent
                        playlistName={playlistName}
                        createdBy={createdBy}
                    />

                    <List style={{ padding: 0, marginBottom: '6em' }}>
                        {tracks.map((track) => {
                            return (
                                <TrackCard key={track.id}>
                                    <GlassyListButton
                                        onClick={() => setCurrentTrack(track)}
                                    >
                                        <TrackCardContent
                                            id={track.id}
                                            metadata={track.metadata}
                                        />
                                    </GlassyListButton>
                                </TrackCard>
                            );
                        })}
                    </List>

                    <MusicPlayer />
                </CenteredContainer>
            </Container>
        );
    }
}

function BackButton() {
    const transitionNav = useTransitionNavigate();
    return (
        <IconButton
            sx={{
                width: 'fit-content',
                marginBottom: '-3.5em',
                fontSize: 'large',
                color: 'white',
                marginLeft: '-0.5em',
            }}
            onClick={() => transitionNav(-1)}
            size="large"
        >
            <ArrowBack />
        </IconButton>
    );
}

const TrackCard = styled(Card)({
    padding: 0,
    width: '100%',
    borderRadius: '0.25em',
    backgroundColor: 'rgba(50,50,50,0.1)',
    marginBottom: '0.25em',
});

const GlassyListButton = Glassy(
    styled(ListItemButton)({
        color: 'white',
        padding: 0,
        width: '100%',
        backgroundColor: 'white',
    })
);

function TrackCardContent(props: { id: number; metadata: TrackMetadata }) {
    const { id, metadata } = props;

    const CardInner = styled(Stack)({
        width: '100%',
        alignItems: 'center',
        gap: '1em',
        '&:hover .card-img': {
            opacity: 0.8,
        },
    });

    const CardImg = styled(Img)({
        width: '20%',
        height: 'auto',
        aspectRatio: 1,
    });

    // Extract image src
    const splits = metadata.coverBase64?.split('.');
    const imgExt = splits ? splits[splits.length - 1] : 'png';
    const mimeType = `image/${imgExt}`;
    const imgSrc = metadata.coverBase64
        ? `data:${mimeType};base64,${metadata.coverBase64}`
        : '/default_track.png';

    return (
        <CardInner direction={'row'}>
            <CardImg src={imgSrc} />
            <Stack direction="column">
                <Typography style={{ marginBottom: '0.2em' }}>
                    {metadata.title ?? `Track #${id}`}
                </Typography>
                <Stack
                    direction="row"
                    spacing="0.5em"
                    style={{
                        color: 'darkgray',
                        paddingTop: '0.2em',
                    }}
                >
                    <Typography>{metadata.artist ?? `Unknown`}</Typography>
                    <Typography>-</Typography>
                    <Typography>{metadata.album ?? `Unknown`}</Typography>
                </Stack>
            </Stack>
        </CardInner>
    );
}

function PlaylistHeaderContent(props: {
    playlistName: string;
    createdBy?: string;
}) {
    const { playlistName, createdBy } = props;
    return (
        <>
            <img
                src={`/default_track.png`}
                alt={`${playlistName} cover image`}
                style={{ width: '75%', borderRadius: '1em' }}
            />
            <Typography variant="h5">{playlistName}</Typography>
            <Typography
                style={{
                    marginTop: -1,
                    marginBottom: '1em',
                    color: 'darkgray',
                }}
            >
                By {createdBy ?? 'Unknown'}
            </Typography>
        </>
    );
}

function CenteredContainer(props: {
    children: JSX.Element[];
    spacing?: string | number;
}) {
    return (
        <Stack direction={'row'} justifyContent={'center'}>
            <Stack
                direction="column"
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                spacing={props.spacing}
            >
                {props.children}
            </Stack>
        </Stack>
    );
}
