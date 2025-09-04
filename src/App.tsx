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

/* State atoms */
export const fadeInAtom = atom(false);
export const showOutletAtom = atom(false);
export const fadeDurationAtom = atom(() => 10);

export default function App() {
    return (
        <FadeGlassy fadeInAtom={fadeInAtom} showOutletAtom={showOutletAtom}>
            <GlassyStack>
                <Outlet />
            </GlassyStack>
        </FadeGlassy>
    );
}

const GlassyStack = Glassy(Stack);
