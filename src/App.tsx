import './App.css';
import {
    createBrowserRouter,
    Navigate,
    redirect,
    RouterProvider,
} from 'react-router-dom';
import useDatabase from './hooks/useDatabase';
import { AuthProvider, getAuthData } from './components/Authenticator';
import { HomePage } from './pages/HomePage';
import { LoadingPage } from './pages/LoadingPage';
import { LoginPage } from './pages/LoginPage';
import { PlaylistPage } from './pages/PlaylistPage';
import { SignupPage } from './pages/SignupPage';
import useStronghold from './hooks/useStronghold';
import { initStronghold } from './utils/stronghold';
import { invoke } from '@tauri-apps/api/core';

// TODO: Add doc comments to all public stuff at lease
//
// TODO: Sanitize username and password for SQL (extra characters etc)

/** The main component of the application. */
function App() {
    let vault = useStronghold();
    const db = useDatabase('test.db');

    // Setup routes
    const router = createBrowserRouter([
        {
            path: '/',
            element: <HomePage vault={vault} />,
            loader: async () => {
                if (!vault) {
                    vault = await initStronghold(
                        await invoke('get_vault_password')
                    );
                }
                const auth = await getAuthData(vault);
                if (!auth?.isValid) {
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
            element: <LoginPage vault={vault} />,
        },
        {
            path: '/signup',
            element: <SignupPage vault={vault} db={db} />,
        },
        {
            path: 'playlist/:playlistId',
            element: <PlaylistPage />,
        },
        {
            path: '*',
            element: <Navigate to="/" />,
        },
    ]);

    return (
        <AuthProvider vault={vault}>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}

export default App;
