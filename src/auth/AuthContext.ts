import { createContext } from 'solid-js';

type AuthContextType = {
  token: string;
  authenticate: (username: string, password: string) => Promise<void>;
  unauthenticate: (username: string, password: string) => void;
};

/** The authentication context. */
export const AuthContext = createContext<AuthContextType | null>(null);
