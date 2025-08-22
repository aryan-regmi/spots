import './App.css';
import {
    createBrowserRouter,
    Navigate,
    redirect,
    RouterProvider,
} from 'react-router-dom';
import useDatabase from './hooks/useDatabase';
import { AuthProvider } from './components/Authenticator';
import { HomePage } from './pages/HomePage';
import { LoadingPage } from './pages/LoadingPage';
import { LoginPage } from './pages/LoginPage';
import { PlaylistPage } from './pages/PlaylistPage';
import { SignupPage } from './pages/SignupPage';
import Database from '@tauri-apps/plugin-sql';
import { getAuthRecord } from './utils/sql';

// TODO: Add doc comments to all public stuff at lease
//
// TODO: Sanitize username and password for SQL (extra characters etc)
//
//
// TODO: Add a export/backup option so that everything can be backed up

/** The main component of the application. */
function App() {
    const dbName = 'spots.db';
    let db = useDatabase(dbName);

    // Setup routes
    const router = createBrowserRouter([
        {
            path: '/',
            element: <HomePage />,
            loader: async () => {
                if (!db) {
                    db = await Database.load(`sqlite:${dbName}`);
                }
                const auth = await getAuthRecord(db);
                if (!auth || !auth.username) {
                    return redirect('/login');
                }
            },
            hydrateFallbackElement: <LoadingPage />,
        },
        {
            path: '/home',
            element: <Navigate to="/" />,
        },
        {
            path: '/login',
            element: <LoginPage db={db} />,
        },
        {
            path: '/signup',
            element: <SignupPage db={db} />,
        },
        {
            path: 'playlist/:playlistId',
            element: <PlaylistPage />,
            loader: async () => {
                if (db) {
                    const auth = await getAuthRecord(db);
                    if (!auth || !auth.username) {
                        return redirect('/login');
                    }
                }
            },
            hydrateFallbackElement: <LoadingPage />,
        },
        {
            path: '/loading',
            element: <LoadingPage />,
        },
        {
            path: '*',
            element: <Navigate to="/" />,
        },
    ]);

    return (
        <AuthProvider db={db}>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}

export default App;
