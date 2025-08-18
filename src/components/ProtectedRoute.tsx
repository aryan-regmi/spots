import { Navigate } from 'react-router-dom';
import { useAuth } from './Authenticator';

export function ProtectedRoute(props: { children: any }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or splash screen
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return props.children;
}
