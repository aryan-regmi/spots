import '@/App.css';
import FadeGlassy from './components/glassy/FadeGlassy';
import Glassy from './components/glassy/Glassy';
import { Outlet } from 'react-router-dom';
import { Stack } from '@mui/material';
import { atom } from 'jotai';
import Loading from './components/loading/Loading';
import { JSX } from 'react';

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
export const fadeGlassyDurationAtom = atom(300);
export const fadeGlassyFallbackElementAtom = atom<JSX.Element | undefined>(
    <Loading spinnerSize="5em" spinnerStyle={{ color: 'white' }} />
);

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
