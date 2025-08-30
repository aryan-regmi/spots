import { atom } from 'jotai';
import { AuthContextType } from '@/components/auth/AuthContext';

/** The default auth context. */
const defaultAuthCtx: AuthContextType = {
    isAuthenticated: false,
    isLoading: true,
    authorize: async () => {},
    unauthorize: async () => {},
};

/** The auth context of the app.*/
export const authCtx = atom(defaultAuthCtx);
