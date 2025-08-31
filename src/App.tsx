import '@/App.css';
import { Outlet } from 'react-router-dom';

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
        <div style={{ display: 'flex' }}>
            <Outlet></Outlet>
        </div>
    );
}
