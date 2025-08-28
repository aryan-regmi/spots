import App from './App';
import { createBrowserRouter, redirect } from 'react-router';
import LoginPage, { loginAction } from './pages/login/LoginPage';
import HomePage from './pages/HomePage';

export const router = createBrowserRouter([
    {
        Component: App,
        children: [
            {
                index: true,
                loader: () => {
                    // FIXME: Check authentication and redirect accordingly
                    //
                    // return isAuthenticated() ? redirect('/home') : redirect('/login');
                    return redirect('/login');
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
        ],
    },
]);
