import '@/App.css';
import { Outlet } from 'react-router-dom';

// TODO: Add theme context
//
// TODO: Better logging
//
// TODO: Move styles to .css files where possible
//
// TODO: Fix backend sql queries (make stuff optional when it is etc)!

export default function App() {
    return (
        <div id="main-content" className="container">
            <Outlet></Outlet>
        </div>
    );
}
