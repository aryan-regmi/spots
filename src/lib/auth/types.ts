import type { User } from '@/user/types';

/** The authentication context. */
export type AuthContext = {
  authUser: () => User | undefined;
  isAuthenticated: () => boolean | undefined;
  isLoading: () => boolean;
  authorize: (user: User) => Promise<void>;
  unauthorize: () => Promise<void>;
};
