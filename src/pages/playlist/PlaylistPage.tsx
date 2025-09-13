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
import { ArrowBack, DragIndicator } from '@mui/icons-material';
import { JSX, useEffect, useRef, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { authContextAtom } from '@/utils/auth/atoms';
import { listen } from '@tauri-apps/api/event';
import { streamPlaylistTracks } from '@/api/music';
import { useParams } from 'react-router-dom';
import MusicPlayer, {
    currentTrackAtom,
    isPlayingAtom,
} from '@/components/player/MusicPlayer';
import Img from '@/components/Img';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { User } from '@/api/users';

// FIXME: Save tracks to localStorage (reset on refresh)
//  - If none in there, then get from the database.
//      - Reorder based on the localStorage one before updating localStorage
//          - Add extra ones to the end

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
    const setIsPlaying = useSetAtom(isPlayingAtom);

    /// All of the tracks belonging to the playlist.
    const [tracks, setTracks] = useState<StreamedTrackMetadata[]>([]);

    const id = playlistId ? parseInt(playlistId) : null;

    // Get tracks from localStorage if availabe, otherwise get them from the database
    useEffect(() => {
        if (!authUser || !id) {
            return;
        }

        const storedTracksString = localStorage.getItem(
            getLocalStorageKey(authUser, id)
        );
        if (storedTracksString) {
            const storedTracks: StreamedTrackMetadata[] =
                JSON.parse(storedTracksString);
            setTracks(storedTracks);
            console.info('Tracks retreived from local storage.');
        } else {
            // Get tracks from the database
            let unlistenTrackStream: Promise<() => void>;
            let unlistenTrackStreamStopped: Promise<() => void>;

            // Setup listeners
            function setupListeners() {
                unlistenTrackStream = listen<StreamedTrackMetadata>(
                    'playlist-track-stream',
                    (event) => {
                        // Deduplicate tracks
                        setTracks((prev) => {
                            const deduplicatedTracks = Array.from(
                                new Map(
                                    [...prev, event.payload].map((track) => [
                                        track.id,
                                        track,
                                    ])
                                ).values()
                            );

                            // Save to local storage
                            if (authUser && id) {
                                localStorage.setItem(
                                    getLocalStorageKey(authUser, id),
                                    JSON.stringify(deduplicatedTracks)
                                );
                            }

                            return deduplicatedTracks;
                        });
                    }
                );

                unlistenTrackStreamStopped = listen(
                    'track-stream-stopped',
                    (_) => {
                        setIsStreamingTracks(false);
                    }
                );
            }

            // Gets the tracks.
            async function getTracks(id: number) {
                await streamPlaylistTracks(id);
            }

            if (authUser) {
                setupListeners();
                setIsStreamingTracks(true);
                console.info('Tracks retreived from database.');

                // Get tracks and save them to local storage
                if (id && id > 0) {
                    getTracks(id);
                }

                return () => {
                    // Stop listeners
                    unlistenTrackStream?.then((off) => off());
                    unlistenTrackStreamStopped?.then((off) => off());
                };
            }
        }
    }, [authUser]);

    function getLocalStorageKey(authUser: User, playlistId: number) {
        return `user-${authUser.id}-playlist-${playlistId}-tracks`;
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setTracks((tracks) => {
                const oldIndex = tracks.findIndex((t) => t.id === active.id);
                const newIndex = tracks.findIndex((t) => t.id === over?.id);
                const updated = arrayMove(tracks, oldIndex, newIndex);

                if (authUser && id) {
                    localStorage.setItem(
                        getLocalStorageKey(authUser, id),
                        JSON.stringify(updated)
                    );
                    console.info(
                        'Saved tracks to local storage: ',
                        getLocalStorageKey(authUser, id)
                    );
                }

                return updated;
            });
        }
    }

    if (isLoading) {
        return <Loading />;
    }

    if (id && id > 0) {
        return (
            <Container direction="column" style={{ color: 'white' }}>
                {/* <Stack></Stack> */}
                <BackButton />

                <CenteredContainer spacing="1em">
                    <PlaylistHeaderContent
                        playlistName={playlistName}
                        createdBy={createdBy}
                    />

                    <div
                        style={{
                            height: '30vh', // or '300px', '40vh', etc.
                            overflowY: 'auto',
                            width: '100%',
                            borderRadius: '1em',
                        }}
                    >
                        <DndContext
                            sensors={useSensors(useSensor(PointerSensor))}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                            modifiers={[restrictToVerticalAxis]}
                        >
                            <SortableContext
                                items={tracks.map((track) => track.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {tracks.map((track) => (
                                    <SortableTrackCard
                                        setCurrentTrack={setCurrentTrack}
                                        setIsPlaying={setIsPlaying}
                                        key={track.id}
                                        track={track}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>

                    <MusicPlayer />
                </CenteredContainer>
            </Container>
        );
    }
}

function SortableTrackCard(props: {
    track: StreamedTrackMetadata;
    setCurrentTrack: any;
    setIsPlaying: any;
}) {
    const { track, setCurrentTrack, setIsPlaying } = props;

    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: track.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TrackCard key={track.id}>
                <GlassyListButton
                    onClick={() => {
                        setCurrentTrack(track);
                        setIsPlaying(true);
                    }}
                >
                    <TrackCardContent id={track.id} metadata={track.metadata} />
                </GlassyListButton>
            </TrackCard>
        </div>
    );
}

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

    const draggableNode = useRef(null);

    return (
        <CardInner direction={'row'} ref={draggableNode}>
            <IconButton
                id={`playlist-track-drag-${id}`}
                style={{ cursor: 'grab' }}
            >
                <DragIndicator
                    style={{
                        color: 'white',
                        padding: 0,
                        margin: 0,
                        marginRight: '-1em',
                        marginLeft: '-0.5em',
                    }}
                />
            </IconButton>
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
