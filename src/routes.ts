import App from '@/App';
import HomePage from '@/pages/home/HomePage';
import Loading from '@/components/loading/Loading';
import LoginPage from '@/pages/login/LoginPage';
import SignupPage from '@/pages/signup/SignupPage';
import { createBrowserRouter, redirect } from 'react-router';
import { getAuthUser } from '@/api/auth';

export const router = createBrowserRouter([
    {
        Component: App,
        children: [
            {
                index: true,
                Component: Loading,
                loader: async () => {
                    const authUser = await getAuthUser();
                    if (!authUser.username) {
                        return redirect('/login');
                    } else {
                        return redirect('/home');
                    }
                },
                HydrateFallback: Loading,
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
            },
            {
                path: '/signup',
                Component: SignupPage,
                HydrateFallback: Loading,
            },
        ],
    },
]);
