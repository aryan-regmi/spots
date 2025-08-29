import App from './App';
import HomePage from './pages/home/HomePage';
import LoginPage, { loginAction } from './pages/login/LoginPage';
import SignupPage, { signupAction } from './pages/signup/SignupPage';
import { createBrowserRouter, redirect } from 'react-router';
import { getAuthUser } from './api/auth';
import Loading from './components/loading/Loading';

export const router = createBrowserRouter([
    {
        Component: App,
        children: [
            {
                index: true,
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
                action: loginAction,
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
                action: signupAction,
                HydrateFallback: Loading,
                loader: async () => {
                    const authUser = await getAuthUser();
                    if (authUser.username) {
                        return redirect('/home');
                    }
                },
            },
        ],
    },
]);
