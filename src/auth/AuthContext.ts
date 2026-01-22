import { User } from '@/mockApi/User';
import { createContext } from 'solid-js';

type AuthContextType = {
  authUser: () => User | null;
  authenticate: (username: string, password: string) => Promise<void>;
  unauthenticate: (username: string) => void;
};

/** The authentication context. */
export const AuthContext = createContext<AuthContextType | null>(null);
