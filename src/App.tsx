import '@/App.css';
import { Outlet } from 'react-router-dom';

// TODO: Add theme context
//
// TODO: Better logging
//
// TODO: Add ErrorBoundary
//  - Add better console.log
//      - Send logs to rust-tracing backend

export default function App() {
    return (
        <div id="main-content" className="container">
            <Outlet></Outlet>
        </div>
    );
}
