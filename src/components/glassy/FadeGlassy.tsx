import Glassy from '@/components/glassy/Glassy';
import { Fade, Stack, styled } from '@mui/material';
import {
    currentFadeGlassyDurationAtom,
    currentFadeGlassyFallbackAtom,
    isFirstLoadAtom,
} from '@/App';
import { atom, useAtom, useAtomValue, WritableAtom } from 'jotai';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export type WritableBooleanAtom = WritableAtom<boolean, [boolean], void>;

export const fadeInAtom = atom(false);
export const showOutletAtom = atom(false);

/**
 * A component that displays a loading screen until the blur/glassy effect is
 * applied.
 **/
export default function FadeGlassy(props: { children: any }) {
    const { children } = props;

    const location = useLocation();
    const [fadeIn, setFadeIn] = useAtom(fadeInAtom);
    const [showOutlet, setShowOutlet] = useAtom(showOutletAtom);
    const fadeDuration = useAtomValue(currentFadeGlassyDurationAtom);
    const fallbackElement = useAtomValue(currentFadeGlassyFallbackAtom);
    const [isFirstLoad, setIsFirstLoad] = useAtom(isFirstLoadAtom);

    useEffect(() => {
        // Reset on location change to restart animation
        setFadeIn(false);
        setShowOutlet(false);

        // Start fade-in animation
        setFadeIn(true);

        const showTimer = setTimeout(() => {
            setShowOutlet(true);
        }, fadeDuration);

        // Reset if firstLoad
        if (isFirstLoad) {
            setTimeout(() => setIsFirstLoad(false), fadeDuration);
        }

        return () => {
            clearTimeout(showTimer);
        };
    }, [location.pathname, fadeDuration]);

    if (!showOutlet) {
        return (
            <GlassyStack
                style={{
                    width: '100vw',
                    height: '100vh',
                    opacity: 0.6,
                }}
            >
                {fallbackElement}
            </GlassyStack>
        );
    }

    return (
        <Fade in={fadeIn} timeout={fadeDuration} appear={true}>
            <GlassyStack
                style={{
                    background: "url('/bg.jpeg') no-repeat center center",
                    backgroundSize: 'cover',
                }}
            >
                {children}
            </GlassyStack>
        </Fade>
    );
}

const GlassyStack = Glassy(
    styled(Stack)({
        width: '100%',
        height: '100%',
        display: 'flex',
    })
);
