import { AuthService, AuthenticationError } from '@/auth/authService';
import { errAsync, fromPromise, okAsync } from 'neverthrow';
import { createStore } from 'solid-js/store';

/** Provides the `AuthService`. */
export function useAuthService() {
  return authState;
}

const AUTH_KEY = 'auth-user';

/** The authentication state. */
const [authState, setAuthState] = createStore<AuthService>({
  authUser: null,
  authenticate,
  unauthenticate,
  isLoading: false,
});

/** The types of errors. */
type ErrorKind = 'InvalidLogin' | 'NoAuthUser';

/** The actual error type returned by the auth service. */
class AuthServiceError implements AuthenticationError {
  constructor(kind: ErrorKind) {
    switch (kind) {
      case 'InvalidLogin':
        this.message = 'Login does not exist';
        break;
      case 'NoAuthUser':
        this.message = 'NoAuthUser';
        break;
    }
  }

  message: string;
}

/** Authenticates the specified user. */
function authenticate(username: string, password: string) {
  setAuthState('isLoading', true);

  // Simulate delay
  let delay = new Promise((resolve) => setTimeout(resolve, 2000));
  fromPromise(delay, console.error);

  // Simulate backend calls
  if (username === 'user' && password === '1') {
    setAuthState('authUser', username);
    setAuthState('isLoading', false);
    localStorage.setItem(AUTH_KEY, username);
    return okAsync();
  } else {
    setAuthState('isLoading', false);
    return errAsync(new AuthServiceError('InvalidLogin'));
  }
}

/** Unauthenticates the currently authenticated user. */
function unauthenticate() {
  setAuthState('isLoading', true);
  if (authState.authUser) {
    setAuthState('authUser', null);
    localStorage.removeItem(AUTH_KEY);
    return errAsync(new AuthServiceError('NoAuthUser'));
  }
  setAuthState('isLoading', false);
  return okAsync();
}
