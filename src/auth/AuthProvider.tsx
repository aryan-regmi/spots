import { createSignal, onMount } from 'solid-js';
import { authenticateUser, AuthUser } from '@/mockApi/User'; // FIXME: Replace with actual API
import { AuthContext } from '@/auth/AuthContext';
import { Data, Effect } from 'effect';

/** Error for authentication failure */
export class AuthenticationError extends Data.TaggedError(
  'AuthenticationError'
)<{
  message: string;
}> {}

/** Authentication provider. */
export function AuthProvider(props: { children: any }) {
  const [authUser, setAuthUser] = createSignal<AuthUser | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);

  /** Sets the `authUser` if there is already one logged in. */
  const loadAuthUser = Effect.gen(function* () {
    setIsLoading(true);
    const authToken = localStorage.getItem('auth-token');
    if (authToken) {
      setAuthUser({ username: authToken });
    }
    setIsLoading(false);
  });

  /** Load authenticated user when compnent gets mounted */
  onMount(() => Effect.runFork(loadAuthUser));

  /** Authenticates the specified user. */
  function authenticate(username: string, password: string) {
    return Effect.tryPromise({
      try: async () => {
        setIsLoading(true);
        const user = await authenticateUser(username, password);

        if (user) {
          setAuthUser(user);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          throw new AuthenticationError({
            message: 'Username and password not found',
          });
        }
      },
      catch: (error: any) => {
        setIsLoading(false);
        return new AuthenticationError({ message: error.message });
      },
    });
  }

  /** Unauthenticates the currently authenticated user. */
  function unauthenticate() {
    return Effect.sync(() => {
      if (authUser() !== null) {
        setAuthUser(null);
        localStorage.removeItem('auth-token');
      }
    });
  }

  return (
    <AuthContext.Provider
      value={{
        authUser,
        authenticate,
        unauthenticate,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
