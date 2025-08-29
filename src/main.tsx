import React from 'react';
import ReactDOM from 'react-dom/client';
import { router } from './routes';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './components/auth/Authenticator';
import {
    QueryClient,
    QueryClientProvider,
    useQuery,
} from '@tanstack/react-query';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
