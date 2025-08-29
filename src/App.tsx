import '@/App.css';
import { Outlet } from 'react-router-dom';

// TODO: Add theme context
//
// TODO: Better logging

export default function App() {
    return (
        <div id="main-content" className="container">
            <Outlet></Outlet>
        </div>
    );
}
