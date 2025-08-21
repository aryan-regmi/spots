import './App.css';
import {
    createBrowserRouter,
    Navigate,
    redirect,
    RouterProvider,
} from 'react-router-dom';
import useDatabase from './hooks/useDatabase';
import useStore from './hooks/useStore';
import { AuthProvider, getAuthData } from './components/Authenticator';
import { HomePage } from './pages/HomePage';
import { LoadingPage } from './pages/LoadingPage';
import { LoginPage } from './pages/LoginPage';
import { PlaylistPage } from './pages/PlaylistPage';
import { SignupPage } from './pages/SignupPage';
import { load } from '@tauri-apps/plugin-store';

// TODO: Change all `Type | null` to be  ?type instead
//
// TODO: Add doc comments to all public stuff at lease
//
// TODO: Use the `Stronghold` Tauri plugin to store passwords

/** The main component of the application. */
function App() {
    const dbName = 'test.db';
    const storeName = 'store.json';

    const db = useDatabase(dbName);
    let store = useStore(storeName);

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
        },
        {
            path: '*',
            element: <Navigate to="/" />,
        },
    ]);

    return (
        <AuthProvider store={store}>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}

export default App;
