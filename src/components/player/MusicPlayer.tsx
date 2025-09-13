import Glassy from '@/components/glassy/Glassy';
import Img from '@/components/Img';
import StreamedTrackMetadata from '@/utils/music/types/trackMetadata';
import { Button, Card, Slider, Stack, styled, Typography } from '@mui/material';
import { PauseCircleRounded, PlayCircleRounded } from '@mui/icons-material';
import { atom, useAtom, useAtomValue } from 'jotai';
import { readFile } from '@tauri-apps/plugin-fs';
import { useEffect, useRef, useState } from 'react';

/** The currently playing track. */
export const currentTrackAtom = atom<StreamedTrackMetadata>();

/** The object URL for the current track. */
const currentTrackUrlAtom = atom(async (get) => {
    const currentTrack = get(currentTrackAtom);
    if (!currentTrack?.metadata.path) {
        return;
    }

    // TODO: Store urls in a map and only create new blobs if necessary
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

/** Determines if a track is currently playing. */
export const isPlayingAtom = atom(false);

export default function MusicPlayer() {
    const [currentTrack, _setCurrentTrack] = useAtom(currentTrackAtom);
    const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
    const currentTrackUrl = useAtomValue(currentTrackUrlAtom);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(audioRef.current?.duration ?? 0);
    const [isSeeking, setIsSeeking] = useState(false);

    // Watches for the track's state (playing or paused/ended).
    useEffect(() => {
        if (audioRef.current && currentTrack) {
            // Track is paused, but it has been clicked so it must start playing
            if (audioRef.current.paused && isPlaying) {
                setIsPlaying(true);
                audioRef.current.play();
                return;
            }

            // If track isn't paused or ended, then its playing
            setIsPlaying(!audioRef.current.paused && !audioRef.current.ended);
        }
    });

    // Handles autoplay when track is clicked
    useEffect(() => {
        let isCancelled = false;

        // Wait for state to update before trying to play
        setTimeout(() => {
            if (currentTrack) {
                audioRef.current?.load();
                audioRef.current
                    ?.play()
                    .catch((e) => console.warn('Autoplay failed:', e));
                setIsPlaying(true);
            }
        }, 200);

        // Cleanup
        return () => {
            isCancelled = true;
            setIsPlaying(false);
        };
    }, [currentTrack]);

    // Set duration when track or audio changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onLoadedMetadata = () => {
            setDuration(audio.duration || 0);
        };

        audio.addEventListener('loadedmetadata', onLoadedMetadata);

        return () => {
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        };
    }, [currentTrack]);

    // Update slider position as audio plays
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const interval = setInterval(() => {
            if (audio.ended) {
                setIsPlaying(false);
                setPosition(0);
                return;
            }

            if (!isSeeking && !audio.paused) {
                setPosition(audio.currentTime);
            }
        }, 500); // update every 500ms

        return () => clearInterval(interval);
    }, [isSeeking, audioRef]);

    // Handle user scrubbing the slider
    const handleSliderChange = (_: any, value: number | number[]) => {
        setPosition(value as number);
    };

    // Seek in the audio when user stops dragging
    const handleSliderChangeCommitted = (_: any, value: number | number[]) => {
        const newTime = value as number;
        setPosition(newTime);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
        setIsSeeking(false);
    };

    const handleSeekStart = () => {
        setIsSeeking(true);
    };

    let trackTitle: string;
    if (currentTrack) {
        trackTitle = currentTrack.metadata.title ?? `Track #${currentTrack.id}`;
    } else {
        trackTitle = 'Unknown';
    }

    // Toggles the play/pause button.
    function togglePlay() {
        if (currentTrack) {
            if (!isPlaying) {
                audioRef.current?.play();
                setIsPlaying(true);
            } else {
                audioRef.current?.pause();
                setIsPlaying(false);
            }
        }
    }

    return (
        <StyledCard>
            <audio ref={audioRef} preload="auto">
                <source src={currentTrackUrl} type="audio/mpeg" />
            </audio>

            <GlassyStack direction="column" width={'100%'} height={'8em'}>
                <Stack
                    direction="row"
                    style={{
                        justifyContent: 'left',
                        flexShrink: 0,
                        alignSelf: 'flex-start',
                    }}
                >
                    <TrackImg
                        src={getImgSrc(currentTrack?.metadata.coverBase64)}
                    />

                    <Stack
                        direction="column"
                        style={{
                            opacity: 0.85,
                            alignItems: 'center',
                            flexShrink: 0,
                        }}
                    >
                        {/* Track details */}
                        <Typography
                            style={{
                                color: 'white',
                                marginTop: '1.5em',
                            }}
                        >
                            {trackTitle}
                        </Typography>
                        <Typography
                            style={{
                                color: 'darkgray',
                                fontSize: '0.9em',
                            }}
                        >
                            {`${currentTrack?.metadata.artist ?? 'Unknown'} - ${currentTrack?.metadata.album ?? 'Unknown'}`}
                        </Typography>

                        {/* Controls  */}
                        <Stack
                            direction="row"
                            style={{
                                flexShrink: 0,
                                alignSelf: 'flex-start',
                                alignItems: 'center',
                            }}
                        >
                            <StyledButton onClick={togglePlay}>
                                {isPlaying ? (
                                    <PauseCircleRounded />
                                ) : (
                                    <PlayCircleRounded />
                                )}
                            </StyledButton>
                            <Slider
                                size="small"
                                sx={{
                                    width: 100,
                                    color: 'white',
                                }}
                                value={position}
                                min={0}
                                step={1}
                                max={duration}
                                onChange={handleSliderChange}
                                onChangeCommitted={handleSliderChangeCommitted}
                                onMouseDown={handleSeekStart}
                            />
                        </Stack>
                    </Stack>
                </Stack>
            </GlassyStack>
        </StyledCard>
    );
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

const StyledCard = styled(Card)({
    padding: 0,
    width: '100%',
    borderRadius: '0.8em',
    backgroundColor: 'rgba(150,100,150,0.35)',
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

const TrackImg = styled(Img)({
    width: '7em',
    height: '7em',
    objectFit: 'cover',
    padding: '1em',
    margin: 0,
    borderRadius: '1.5em',
    opacity: 0.85,
    flexShrink: 0,
    alignSelf: 'flex-start',
});
