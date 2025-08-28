import App from './App';
import { createBrowserRouter, redirect } from 'react-router';
import LoginPage, { loginAction } from './pages/login/LoginPage';
import HomePage from './pages/HomePage';
import { getAuthUser } from './api/auth';
import SignupPage from './pages/signup/SignupPage';

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
            },
            {
                path: '/login',
                Component: LoginPage,
                action: loginAction,
            },
            {
                path: '/home',
                Component: HomePage,
            },
            {
                path: '/signup',
                Component: SignupPage,
            },
        ],
    },
]);
