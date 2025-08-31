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

export default function App() {
    return (
        <div id="main-content" className="container">
            <Outlet></Outlet>
        </div>
    );
}
