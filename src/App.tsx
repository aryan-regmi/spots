import '@/App.css';
import { Fade, Stack, styled } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Glassy from './components/Glassy';
import { useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import Loading from './components/loading/Loading';

// TODO: Add theme context
//
// TODO: Better logging
//
// TODO: Add ErrorBoundary
//  - Add better console.log
//      - Send logs to rust-tracing backend
//
// TODO: Make `Loading` component take prop for text content
//
// TODO: Add transitions (CSSTransitions component)
//
// TODO: Make buttons responsive (show loading state on click etc...)
//
// TODO: Move styles to styled.ts (for components?)

/* State atoms */
const fadeInAtom = atom(false);
const showOutletAtom = atom(false);

export default function App() {
    const [fadeIn, setFadeIn] = useAtom(fadeInAtom);
    const [showOutlet, setShowOutlet] = useAtom(showOutletAtom);
    const fadeDuration = 300;

    useEffect(() => {
        // Start fade-in when mounted
        setFadeIn(true);

        // Wait for fade transition to complete (500ms as set below)
        const timeout = setTimeout(() => {
            setShowOutlet(true);
        }, fadeDuration); // Match Fade `timeout={500}`

        return () => clearTimeout(timeout);
    }, []);

    if (!showOutlet) {
        return (
            <GlassyStack
                style={{
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'black',
                    opacity: 0.6,
                }}
            >
                <GlassyLoad />
                {/* <Loading /> */}
            </GlassyStack>
        );
    }

    return (
        <div style={{ width: `100vw`, height: '100vh', display: 'flex' }}>
            <Fade in={fadeIn} timeout={fadeDuration} appear={true}>
                <GlassyStack
                    style={{
                        width: '100%',
                        height: '100%',
                        background:
                            "url('./public/bg.jpeg') no-repeat center center",
                        backgroundSize: 'cover',
                    }}
                >
                    <Outlet />
                </GlassyStack>
            </Fade>
        </div>
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
