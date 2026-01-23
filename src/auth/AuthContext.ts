import { AuthUser } from '@/mockApi/User';
import { createContext } from 'solid-js';

type AuthContextType = {
  authUser: () => AuthUser | null;
  authenticate: (username: string, password: string) => Promise<void>;
  unauthenticate: (username: string) => void;
  loading: () => boolean;
};

/** The authentication context. */
export const AuthContext = createContext<AuthContextType | null>(null);
