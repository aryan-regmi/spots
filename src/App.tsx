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
import { AuthProvider, useAuth } from './components/Authenticator';
import { ProtectedRoute } from './components/ProtectedRoute';
import { load, Store } from '@tauri-apps/plugin-store';
import { useEffect, useState } from 'react';
import { loadStore } from './utils/common';

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
        <AuthProvider>
            <Router>
                <AppRoutes db={db} store={store} />
            </Router>
        </AuthProvider>
    );
}

function AppRoutes(props: { db: Database | null; store: Store | null }) {
    let { db, store } = props;
    useRouteTracker();

    // TODO: Replace with react-router's loader() instead!

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoaded, setAuthLoaded] = useState(false);
    const [hpr, setHpr] = useState(<Route></Route>);
    useEffect(() => {
        const loadAuth = async () => {
            if (store != null) {
                let auth = await store.get<boolean>('authenticated');
                auth ? setAuthLoaded(auth) : setAuthLoaded(false);
                setIsAuthenticated(auth === true);
            }
        };
        loadAuth();
    }, [store]);

    let { loading } = useAuth();

    if (!isAuthenticated && loading) {
        return <div>Loading...</div>;
    } else {
        return (
            <Routes>
                {isAuthenticated ? (
                    <Route path="/" element={<HomePage />}></Route>
                ) : (
                    <Route
                        path="/"
                        element={<LoginPage db={db}></LoginPage>}
                    ></Route>
                )}
                <Route path="/login" element={<LoginPage db={db} />}></Route>
                <Route path="/signup" element={<SignupPage db={db} />} />
                <Route
                    path="/home/:username"
                    element={
                        <ProtectedRoute>
                            <HomePage />
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
}

export default App;
