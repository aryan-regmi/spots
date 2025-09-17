import type { User } from '@/user/types';
import { Writable } from 'svelte/store';

/** The authentication state. */
type AuthState = { user: User | undefined; isAuthenticated: boolean };

/** The authentication context. */
export type AuthContext = {
  authState: AuthState;
  authorize: (user: User) => Promise<void>;
  unauthorize: () => Promise<void>;
};
