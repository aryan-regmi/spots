import type { User } from '@/user/types';

/** The authentication context. */
export type AuthContext = {
  authUser: () => User;
  isAuthenticated: () => boolean;
  authorize: (user: User) => Promise<void>;
  unauthorize: () => Promise<void>;
};
