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
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import { useEffect } from 'react';

// TODO: TEST ON ANDROID!!!
//
// TODO: Add doc comments to all public stuff at lease
//
// TODO: Add a export/backup option so that everything can be backed up

/** The main component of the application. */
function App() {
    // FIXME: Remove in prod
    //
    // Sets window to mobile view
    let window = getCurrentWindow();
    useEffect(() => {
        async function mobileView() {
            await window.setSize(new LogicalSize(375, 812));
        }
        mobileView();
    }, [window]);

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
