import '@/App.css';
import { Outlet } from 'react-router-dom';
import { atom } from 'jotai';
import FadeGlassy from './components/glassy/FadeGlassy';
import Glassy from './components/glassy/Glassy';
import { Stack } from '@mui/material';

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

/* State atoms */
export const fadeInAtom = atom(false);
export const showOutletAtom = atom(false);

export default function App() {
    return (
        <FadeGlassy
            fadeInAtom={fadeInAtom}
            showOutletAtom={showOutletAtom}
            fadeDuration={100}
        >
            <GlassyStack>
                <Outlet />
            </GlassyStack>
        </FadeGlassy>
    );
}

const GlassyStack = Glassy(Stack);
