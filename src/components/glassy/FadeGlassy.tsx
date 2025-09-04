import Glassy from '@/components/glassy/Glassy';
import { Fade, Stack, styled } from '@mui/material';
import { fadeDurationAtom } from '@/App';
import { useAtom, useAtomValue, WritableAtom } from 'jotai';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Loading from '../loading/Loading';

export type WritableBooleanAtom = WritableAtom<boolean, [boolean], void>;

/**
 * A component that displays a loading screen until the blur/glassy effect is
 * applied.
 **/
export default function FadeGlassy(props: {
    fadeInAtom: WritableBooleanAtom;
    showOutletAtom: WritableBooleanAtom;
    children: any;
}) {
    const { fadeInAtom, showOutletAtom, children } = props;

    const location = useLocation();
    const [fadeIn, setFadeIn] = useAtom(fadeInAtom);
    const [showOutlet, setShowOutlet] = useAtom(showOutletAtom);
    const fadeDuration = useAtomValue(fadeDurationAtom);

    useEffect(() => {
        // Reset on location change to restart animation
        setFadeIn(false);
        setShowOutlet(false);

        // Start fade-in animation
        setFadeIn(true);

        const showTimer = setTimeout(() => {
            setShowOutlet(true);
        }, fadeDuration);

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
            />
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
