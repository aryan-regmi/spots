import useAuth from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

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
