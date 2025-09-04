import App from '@/App';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import Loading from '@/components/loading/Loading';
import LoginPage from '@/pages/login/LoginPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import SignupPage from '@/pages/signup/SignupPage';
import { createBrowserRouter, redirect } from 'react-router';
import { getAuthUser } from '@/api/auth';

export const router = createBrowserRouter([
    {
        element: <App />,
        hydrateFallbackElement: <Loading />,
        children: [
            {
                index: true,
                element: <Loading />,
                loader: async () => {
                    const authUser = await getAuthUser();
                    if (authUser?.username) {
                        return redirect('/dashboard');
                    } else {
                        return redirect('/login');
                    }
                },
            },
            {
                path: '/dashboard',
                element: <DashboardPage />,
                loader: async () => {
                    const authUser = await getAuthUser();
                    if (!authUser?.username) {
                        return redirect('/login');
                    }
                },
            },
            {
                path: '/login',
                element: <LoginPage />,
                loader: async () => {
                    const authUser = await getAuthUser();
                    if (authUser?.username) {
                        return redirect('/dashboard');
                    }
                },
            },
            {
                path: '/signup',
                element: <SignupPage />,
                loader: async () => {
                    const authUser = await getAuthUser();
                    if (authUser?.username) {
                        return redirect('/dashboard');
                    }
                },
            },
            {
                path: '/dashboard/profile',
                element: <ProfilePage />,
            },
        ],
    },
]);
