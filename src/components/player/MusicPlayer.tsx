import StreamedTrackMetadata from '@/utils/music/types/trackMetadata';
import {
    PauseCircle,
    PauseCircleRounded,
    PlayCircle,
    PlayCircleRounded,
} from '@mui/icons-material';
import {
    Button,
    Card,
    CardActions,
    CardContent,
    IconButton,
    Stack,
    styled,
    Typography,
} from '@mui/material';
import { readFile } from '@tauri-apps/plugin-fs';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
import Glassy from '../glassy/Glassy';

/** The currently playing track. */
export const currentTrackAtom = atom<StreamedTrackMetadata>();

/** The object URL for the current track. */
const currentTrackUrlAtom = atom(async (get) => {
    const currentTrack = get(currentTrackAtom);
    if (!currentTrack?.metadata.path) {
        return;
    }

    try {
        const binary = await readFile(currentTrack.metadata.path);

        const blob = new Blob([new Uint8Array(binary)], {
            type: 'audio/mpeg',
        });
        const trackUrl = URL.createObjectURL(blob);
        return trackUrl;
    } catch (e: any) {
        console.error('Failed to load audio:', e);
    }
});

export default function MusicPlayer() {
    const [currentTrack, _setCurrentTrack] = useAtom(currentTrackAtom);
    const currentTrackUrl = useAtomValue(currentTrackUrlAtom);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        let isCancelled = false;

        // Wait for state to update before trying to play
        setTimeout(() => {
            audioRef.current?.load();
            audioRef.current
                ?.play()
                .catch((e) => console.warn('Autoplay failed:', e));
        }, 0);

        // Clean up object url when track changes
        return () => {
            isCancelled = true;
            if (currentTrackUrl) {
                URL.revokeObjectURL(currentTrackUrl);
            }
        };
    }, [currentTrack]);

    function handlePlay() {
        if (currentTrack) {
            audioRef.current?.play();
        }
    }

    function handlePause() {
        if (currentTrack) {
            audioRef.current?.pause();
        }
    }

    /** Gets the image source for the `base64` encoded image.*/
    function getImgSrc(imgBase64?: string) {
        const imgParts = imgBase64?.split('.');
        const extension = imgParts ? imgParts[imgParts.length - 1] : 'png';
        const mimeType = `image/${extension}`;
        const imgSrc = imgBase64
            ? `data:${mimeType};base64,${imgBase64}`
            : '/default_track.png';
        return imgSrc;
    }

    let trackTitle: string;
    if (currentTrack) {
        trackTitle = currentTrack.metadata.title ?? `Track #${currentTrack.id}`;
    } else {
        trackTitle = 'Unknown';
    }

    return (
        <StyledCard>
            <audio ref={audioRef} preload="auto">
                <source src={currentTrackUrl} type="audio/mpeg" />
            </audio>

            <GlassyStack direction="column">
                <Stack
                    direction="row"
                    style={{ justifyContent: 'left' }}
                    spacing={'0.1em'}
                >
                    <img
                        src={getImgSrc(currentTrack?.metadata.coverBase64)}
                        style={{
                            width: '35%',
                            height: 'auto',
                            aspectRatio: 1,
                            padding: '1em',
                            margin: 0,
                            borderRadius: '1.5em',
                            opacity: 0.85,
                        }}
                    />

                    <Stack
                        direction="column"
                        style={{
                            opacity: 0.85,
                            alignItems: 'center',
                        }}
                    >
                        <Typography
                            style={{
                                color: 'white',
                                paddingTop: '2em',
                                fontSize: '1.2em',
                            }}
                        >
                            {trackTitle}
                        </Typography>
                        <Typography
                            style={{
                                color: 'darkgray',
                                fontSize: '0.8em',
                                paddingLeft: '1em',
                            }}
                        >
                            {currentTrack?.metadata.artist ?? 'Unknown'}
                        </Typography>
                        <Stack direction="row">
                            <StyledButton onClick={handlePlay}>
                                <PlayCircleRounded fontSize="large" />
                            </StyledButton>
                            <StyledButton onClick={handlePause}>
                                <PauseCircleRounded fontSize="large" />
                            </StyledButton>
                        </Stack>
                    </Stack>
                </Stack>
            </GlassyStack>
        </StyledCard>
    );
}

const StyledCard = styled(Card)({
    padding: 0,
    width: '100%',
    borderRadius: '0.25em',
    backgroundColor: 'rgba(200,50,150,0.25)',
    marginBottom: '0.25em',
});

const GlassyStack = Glassy(
    styled(Stack)({
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    })
);

const StyledButton = styled(Button)({
    color: 'rgba(255,255,255,0.8)',
    padding: '1em',
});
