import { createSignal, onMount } from 'solid-js';
import { authenticateUser, AuthUser } from '@/mockApi/User'; // FIXME: Replace with actual API
import { AuthContext } from '@/auth/AuthContext';

/** Authentication provider. */
export function AuthProvider(props: { children: any }) {
  const [authUser, setAuthUser] = createSignal<AuthUser | null>(null);
  const [loading, setLoading] = createSignal(false);

  /** Sets the `authUser` if there is already one logged in. */
  onMount(() => {
    setLoading(true);
    const authToken = localStorage.getItem('auth-token');
    if (authToken) {
      setAuthUser({ username: authToken });
    }
    setLoading(false);
  });

  /** Authenticates the specified user. */
  async function authenticate(username: string, password: string) {
    setLoading(true);
    const user = await authenticateUser(username, password);
    if (user) {
      setAuthUser(user);
      setLoading(false);
    } else {
      setLoading(false);
      throw 'Username and password not found';
    }
  }

  /** Unauthenticates the currently authenticated user. */
  function unauthenticate() {
    if (authUser() !== null) {
      setAuthUser(null);
      localStorage.removeItem('auth-token');
    }
  }

  return (
    <AuthContext.Provider
      value={{
        authUser,
        authenticate,
        unauthenticate,
        loading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
