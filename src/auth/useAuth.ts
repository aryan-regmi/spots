import { AuthContext, AuthContextType } from '@/auth/AuthContext';
import { AuthenticationError } from '@/auth/AuthProvider';
import { Effect } from 'effect';
import { useContext } from 'solid-js';

/** Represents the result of the `getAuthContext` effect. */
type AuthContextResult = {
  isError: boolean;
  context: AuthContextType | AuthenticationError;
};

/** Hook to use the authentication context. */
export default function useAuth(): AuthContextResult {
  let authContext: any;
  Effect.runPromise(getAuthContext).then((ctx) => {
    authContext = ctx;
  });
  return authContext;
}

/** Retrieves the auth context. */
export const getAuthContext: Effect.Effect<AuthContextResult> = Effect.gen(
  function* () {
    const authContext = useContext(AuthContext);
    if (authContext) {
      return { isError: false, context: authContext };
    } else {
      return {
        isError: true,
        context: new AuthenticationError({
          message: '`useAuth` must be used within an `AuthProvider`',
        }),
      };
    }
  }
);
