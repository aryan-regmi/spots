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
        Component: App,
        hydrateFallbackElement: <Loading />,
        children: [
            {
                index: true,
                Component: Loading,
                hydrateFallbackElement: <Loading />,
                loader: async () => {
                    const authUser = await getAuthUser();
                    if (authUser.username) {
                        return redirect('/dashboard');
                    } else {
                        return redirect('/login');
                    }
                },
            },
            {
                path: '/dashboard',
                Component: DashboardPage,
                HydrateFallback: Loading,
                loader: async () => {
                    const authUser = await getAuthUser();
                    if (!authUser.username) {
                        return redirect('/login');
                    }
                },
            },
            {
                path: '/login',
                Component: LoginPage,
                hydrateFallbackElement: <Loading />,
                loader: async () => {
                    const authUser = await getAuthUser();
                    if (authUser.username) {
                        return redirect('/dashboard');
                    }
                },
            },
            {
                path: '/signup',
                Component: SignupPage,
                hydrateFallbackElement: <Loading />,
                loader: async () => {
                    const authUser = await getAuthUser();
                    if (authUser.username) {
                        return redirect('/dashboard');
                    }
                },
            },
            {
                path: '/dashboard/profile',
                Component: ProfilePage,
                hydrateFallbackElement: <Loading />,
            },
        ],
    },
]);
