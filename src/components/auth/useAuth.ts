import { AuthContext } from './AuthContext';
import { useContext, useEffect } from 'react';

/** Returns the authentication context. */
export default function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
