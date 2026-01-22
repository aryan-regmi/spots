import { createSignal } from 'solid-js';
import { authenticateUser, User } from '@/mockApi/User'; // FIXME: Replace with actual API
import { AuthContext } from '@/auth/AuthContext';

/** Authentication provider. */
export function AuthProvider(props: { children: any }) {
  const [authUser, setAuthUser] = createSignal<User | null>(null);

  /** Authenticates the specified user. */
  async function authenticate(username: string, password: string) {
    const user = await authenticateUser(username, password);
    if (user) {
      setAuthUser(user);
    } else {
      throw 'Username and password not found';
    }
  }

  /** Unauthenticates the currently authenticated user. */
  function unauthenticate() {
    if (authUser() !== null) {
      setAuthUser(null);
      sessionStorage.removeItem('auth-token');
    }
  }

  return (
    <AuthContext.Provider
      value={{
        authUser,
        authenticate,
        unauthenticate,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
