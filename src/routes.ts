import App from './App';
import HomePage from './pages/HomePage';
import LoginPage, { loginAction } from './pages/login/LoginPage';
import SignupPage, { signupAction } from './pages/signup/SignupPage';
import { CircularProgress } from '@mui/material';
import { createBrowserRouter, redirect } from 'react-router';
import { getAuthUser } from './api/auth';

export const router = createBrowserRouter([
    {
        Component: App,
        children: [
            {
                index: true,
                loader: async () => {
                    let authUser = await getAuthUser();
                    if (!authUser.username) {
                        return redirect('/login');
                    } else {
                        return redirect('/home');
                    }
                },
                HydrateFallback: CircularProgress,
            },
            {
                path: '/login',
                Component: LoginPage,
                action: loginAction,
                HydrateFallback: CircularProgress,
            },
            {
                path: '/home',
                Component: HomePage,
                HydrateFallback: CircularProgress,
            },
            {
                path: '/signup',
                Component: SignupPage,
                action: signupAction,
                HydrateFallback: CircularProgress,
            },
        ],
    },
]);
