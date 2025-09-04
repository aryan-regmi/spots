import { useAtom, WritableAtom } from 'jotai';
import { useEffect } from 'react';
import Glassy from './Glassy';
import { Fade, Stack, styled } from '@mui/material';
import Loading from '../loading/Loading';
import { useLocation } from 'react-router-dom';

export type WritableBooleanAtom = WritableAtom<boolean, [boolean], void>;

/**
 * A component that displays a loading screen until the blur/glassy effect is
 * applied.
 **/
export default function FadeGlassy(props: {
    fadeInAtom: WritableBooleanAtom;
    showOutletAtom: WritableBooleanAtom;
    fadeDuration: number;
    children: any;
}) {
    const { fadeInAtom, showOutletAtom, fadeDuration, children } = props;

    const location = useLocation();
    const [fadeIn, setFadeIn] = useAtom(fadeInAtom);
    const [showOutlet, setShowOutlet] = useAtom(showOutletAtom);

    useEffect(() => {
        // Reset on location change to restart animation
        setFadeIn(false);
        setShowOutlet(false);

        // Start fade-in animation
        let adjustedFadeDuration;
        if (fadeDuration <= 150) {
            adjustedFadeDuration = 50;
        } else {
            adjustedFadeDuration = fadeDuration - 150;
        }
        const fadeTimer = setTimeout(() => {
            setFadeIn(true);
        }, adjustedFadeDuration);

        const showTimer = setTimeout(() => {
            setShowOutlet(true);
        }, adjustedFadeDuration);
        /* }, fadeDuration + 100); */

        return () => {
            clearTimeout(fadeTimer);
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
                <GlassyLoad />
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

const GlassyLoad = Glassy(Loading);
