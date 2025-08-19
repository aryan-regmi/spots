import {
    createBrowserRouter,
    Navigate,
    redirect,
    RouterProvider,
} from 'react-router-dom';
import './App.css';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { SignupPage } from './pages/SignupPage';
import { loadDatabase } from './utils/sql';
import { PlaylistPage } from './pages/PlaylistPage';
import { AuthProvider, getAuthData } from './components/Authenticator';
import { loadStore } from './utils/common';
import { load } from '@tauri-apps/plugin-store';
import { LoadingPage } from './pages/LoadingPage';

/** The main component of the application. */
function App() {
    // Load database
    const dbName = 'test.db';
    const db = loadDatabase(dbName);

    // Store for auth
    const storeName = 'store.json';
    let store = loadStore(storeName);

    // Setup routes
    const router = createBrowserRouter([
        {
            path: '/',
            element: <HomePage store={store} />,
            loader: async () => {
                if (!store) {
                    store = await load(storeName);
                }
                const auth = await getAuthData(store);
                if (!auth?.isValid) {
                    return redirect('/login');
                }
            },
            hydrateFallbackElement: <LoadingPage />,
        },
        {
            path: '/home',
            element: <Navigate to="/" />,
            hydrateFallbackElement: <LoadingPage />,
        },
        {
            path: '/login',
            element: <LoginPage db={db} store={store} />,
            hydrateFallbackElement: <LoadingPage />,
        },
        {
            path: '/signup',
            element: <SignupPage db={db} />,
            hydrateFallbackElement: <LoadingPage />,
        },
        {
            path: 'playlist/:playlistId',
            element: <PlaylistPage />,
            hydrateFallbackElement: <LoadingPage />,
        },
        {
            path: '*',
            element: <Navigate to="/" />,
            hydrateFallbackElement: <LoadingPage />,
        },
    ]);

    return (
        <AuthProvider store={store}>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}

export default App;
