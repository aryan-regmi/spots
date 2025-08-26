import './App.css';
import {
    createBrowserRouter,
    Navigate,
    redirect,
    RouterProvider,
} from 'react-router-dom';
import { AuthProvider } from './components/Authenticator';
import { HomePage } from './pages/HomePage';
import { LoadingPage } from './pages/LoadingPage';
import { LoginPage } from './pages/LoginPage';
import { PlaylistPage } from './pages/PlaylistPage';
import { SignupPage } from './pages/SignupPage';
import { getAuthUser } from './services/api/database';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfilePage } from './pages/ProfilePage';
import { useEffect } from 'react';
import { currentMonitor, getCurrentWindow } from '@tauri-apps/api/window';

// TODO: TEST ON ANDROID!!!
//
// TODO: Add doc comments to all public stuff at lease
//
// TODO: Add a export/backup option so that everything can be backed up
//
// TODO: Move `Log Out` button from bottom of page to nav drawer
//
// TODO: Replace custom components with Material-UI when possible
//  - Card
//  - Link
//  - div with Box, Grid, Stack
//      - replace `row` and `col` css stuff
//  - alerts with Modal
//
// FIXME: Move all styling to .css files

/** The main component of the application. */
function App() {
    // Setup window
    useEffect(() => {
        async function resizeToMobile() {
            let monitor = await currentMonitor();
            if (monitor) {
                await getCurrentWindow().setSize(monitor?.size);
            }
        }
        resizeToMobile();
    }, []);

    // Setup query client
    const queryClient = new QueryClient();

    // Setup routes
    const router = createBrowserRouter([
        {
            path: '/',
            element: <HomePage />,
            loader: async () => {
                let auth = await getAuthUser();
                if (!auth.username) {
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
            path: '/home/profile',
            element: <ProfilePage />,
        },
        {
            path: '/login',
            element: <LoginPage />,
        },
        {
            path: '/signup',
            element: <SignupPage />,
        },
        {
            path: 'playlist/:playlistId',
            element: <PlaylistPage />,
            loader: async () => {
                const auth = await getAuthUser();
                if (!auth.username) {
                    return redirect('/login');
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
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
