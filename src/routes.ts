import App from '@/App';
import HomePage from '@/pages/home/HomePage';
import Loading from '@/components/loading/Loading';
import LoginPage from '@/pages/login/LoginPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import SignupPage from '@/pages/signup/SignupPage';
import { createBrowserRouter, redirect } from 'react-router';
import { getAuthUser } from '@/api/auth';

export const router = createBrowserRouter([
    {
        Component: App,
        children: [
            {
                index: true,
                loader: async () => {
                    const authUser = await getAuthUser();
                    if (authUser.username) {
                        return redirect('/home');
                    } else {
                        return redirect('/login');
                    }
                },
            },
            {
                path: '/home',
                Component: HomePage,
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
                HydrateFallback: Loading,
                loader: async () => {
                    const authUser = await getAuthUser();
                    if (authUser.username) {
                        return redirect('/home');
                    }
                },
            },
            {
                path: '/signup',
                Component: SignupPage,
                HydrateFallback: Loading,
                loader: async () => {
                    const authUser = await getAuthUser();
                    if (authUser.username) {
                        return redirect('/home');
                    }
                },
            },
            {
                path: '/home/profile',
                Component: ProfilePage,
                HydrateFallback: Loading,
            },
        ],
    },
]);
