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

/** Determines if this is the first app load. */
export const isFirstLoadAtom = atom(true);

/** The atom that allows customizing the duration for [FadeGlassy] component. */
export const fadeGlassyDurationAtom = atom(50);

/** The atom that allows customizing the fallback element for [FadeGlassy] component. */
export const fadeGlassyFallbackAtom = atom<JSX.Element>();

/** The **current** duration for the [FadeGlassy] component. */
export const currentFadeGlassyDurationAtom = atom((get) =>
    get(isFirstLoadAtom) ? 300 : get(fadeGlassyDurationAtom)
);

/** The **current** fallback element for the [FadeGlassy] component. */
export const currentFadeGlassyFallbackAtom = atom((get) =>
    get(isFirstLoadAtom) ? (
        <Loading spinnerSize="5em" spinnerStyle={{ color: 'white' }} />
    ) : (
        get(fadeGlassyFallbackAtom)
    )
);

export default function App() {
    return (
        <FadeGlassy>
            <GlassyStack>
                <Outlet />
            </GlassyStack>
        </FadeGlassy>
    );
}

const GlassyStack = Glassy(Stack);
