import '@/App.css';
import { Fade, Stack } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Glassy from './components/Glassy';

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

export default function App() {
    return (
        <Fade in={true} timeout={500} appear={true}>
            <GlassyStack style={{ width: '100vw', height: '100vh' }}>
                <Outlet></Outlet>
            </GlassyStack>
        </Fade>
    );
}

const GlassyStack = Glassy(Stack);
