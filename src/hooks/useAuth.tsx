import { AuthContext } from '../components/Authenticator';
import { useContext } from 'react';

/** Hook to use the authentication context. */
export default function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
