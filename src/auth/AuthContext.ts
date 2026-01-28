import { AuthUser } from '@/mockApi/User';
import { AuthenticationError } from '@/auth/AuthProvider';
import { Effect } from 'effect';
import { createContext } from 'solid-js';

export type AuthContextType = {
  authUser: () => AuthUser | null;
  authenticate: (
    username: string,
    password: string
  ) => Effect.Effect<void, AuthenticationError, never>;
  unauthenticate: (username: string) => Effect.Effect<void, never, never>;
  isLoading: () => boolean;
};

/** The authentication context. */
export const AuthContext = createContext<AuthContextType | null>(null);
