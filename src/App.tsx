import {
    Navigate,
    Route,
    HashRouter as Router,
    Routes,
} from 'react-router-dom';
import './App.css';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { SignupPage } from './pages/SignupPage';
import { loadDatabase } from './utils/sql';
import { PlaylistPage } from './pages/PlaylistPage';
import Database from '@tauri-apps/plugin-sql';
import { useRouteTracker } from './utils/hooks/useRouteTracker';

/** The main component of the application. */
function App() {
    // Load database
    const dbName = 'test.db';
    const db = loadDatabase(dbName);

    // Setup routes
    return (
        <Router>
            <AppRoutes db={db} />
        </Router>
    );
}

function AppRoutes(props: { db: Database | null }) {
    let { db } = props;
    useRouteTracker();

    return (
        <Routes>
            <Route path="/" element={<LoginPage db={db} />}></Route>
            <Route path="/login" element={<Navigate to="/" replace />} />

            <Route path="/home/:username" element={<HomePage />} />
            <Route
                path="/home/:username/playlists/:playlistId"
                element={<PlaylistPage />}
            />

            <Route path="/signup" element={<SignupPage db={db} />} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
