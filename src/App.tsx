import {
    Navigate,
    redirect,
    Route,
    HashRouter as Router,
    Routes,
} from 'react-router-dom';
import './App.css';
import { LoginPage } from './pages/LoginPage';
import { HomePage, homePageLoader } from './pages/HomePage';
import { SignupPage } from './pages/SignupPage';
import { loadDatabase } from './utils/sql';
import { PlaylistPage } from './pages/PlaylistPage';
import Database from '@tauri-apps/plugin-sql';
import { useRouteTracker } from './utils/hooks/useRouteTracker';
import { AuthProvider, useAuth } from './components/Authenticator';
import { ProtectedRoute } from './components/ProtectedRoute';
import { loadStore } from './utils/common';
import { Store } from '@tauri-apps/plugin-store';

/** The main component of the application. */
function App() {
    // Load database
    const dbName = 'test.db';
    const db = loadDatabase(dbName);

    // Store for auth
    const storeName = 'store.json';
    const store = loadStore(storeName);

    // Setup routes
    return (
        <AuthProvider store={store}>
            <Router>
                <AppRoutes db={db} store={store} />
            </Router>
        </AuthProvider>
    );
}

function AppRoutes(props: { db: Database | null; store: Store | null }) {
    // Hooks
    useRouteTracker();

    // Get props
    let { db, store } = props;

    return (
        <Routes>
            <Route
                path="/"
                element={<HomePage store={store} />}
                loader={homePageLoader}
            ></Route>
            <Route path="/login" element={<LoginPage db={db} />}></Route>
            <Route path="/signup" element={<SignupPage db={db} />} />
            <Route
                path="/home/:username"
                element={
                    <ProtectedRoute>
                        <HomePage store={store} />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/home/:username/playlists/:playlistId"
                element={
                    <ProtectedRoute>
                        <PlaylistPage />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
