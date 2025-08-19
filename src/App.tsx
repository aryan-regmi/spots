import './App.css';
import {
    createBrowserRouter,
    Navigate,
    redirect,
    Route,
    RouterProvider,
} from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { SignupPage } from './pages/SignupPage';
import { loadDatabase } from './utils/sql';
import { PlaylistPage } from './pages/PlaylistPage';
import { isAuthenticated } from './components/Authenticator';
import { loadStore } from './utils/common';
import { basicTracker, trackRoute } from './utils/hooks/routeTracker';
import { load } from '@tauri-apps/plugin-store';
import { LoadingPage } from './pages/Loading';

/** The main component of the application. */
function App() {
    // Load database
    const dbName = 'test.db';
    const db = loadDatabase(dbName);

    // Store for auth
    const storeName = 'store.json';
    let store = loadStore(storeName);
    // let store: Store | null = null;

    // Setup routes
    // trackRoutes[0] = true;
    const router = createBrowserRouter([
        {
            path: '/',
            element: <HomePage store={store} />,
            loader: async ({ request }) => {
                if (!store) {
                    store = await load(storeName);
                }
                const auth = await isAuthenticated(store);
                if (!auth?.valid) {
                    return redirect('/login');
                }
                const url = new URL(request.url);
                trackRoute(url.pathname);
            },
            hydrateFallbackElement: <LoadingPage></LoadingPage>,
        },
        {
            path: '/home',
            element: <Navigate to="/" />,
            hydrateFallbackElement: <LoadingPage></LoadingPage>,
        },
        {
            path: '/login',
            element: <LoginPage db={db} store={store} />,
            loader: ({ request }) => basicTracker(request),
            hydrateFallbackElement: <LoadingPage></LoadingPage>,
        },
        {
            path: '/signup',
            element: <SignupPage db={db} />,
            loader: ({ request }) => basicTracker(request),
            hydrateFallbackElement: <LoadingPage></LoadingPage>,
        },
        {
            path: 'playlist/:playlistId',
            element: <PlaylistPage />,
            loader: ({ request }) => basicTracker(request),
            hydrateFallbackElement: <LoadingPage></LoadingPage>,
        },
        {
            path: '*',
            element: <Navigate to="/" />,
            hydrateFallbackElement: <LoadingPage></LoadingPage>,
        },
    ]);

    return <RouterProvider router={router} />;
}

export default App;
