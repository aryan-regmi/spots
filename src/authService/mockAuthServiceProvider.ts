import { AuthService, AuthenticationError } from '@/authService/authService';
import {
  AUTH_STORE_NAME,
  useDbService,
} from '@/dbService/mockDBServiceProvider';
import { errAsync, fromPromise, okAsync } from 'neverthrow';
import { createStore } from 'solid-js/store';

/** Provides the `AuthService`. */
export function useAuthService() {
  return authState;
}

/** Type of records in the auth store. */
type AuthStoreRecord = {
  user: string;
  password?: string;
  isAuth: boolean;
};

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

const { putRecord, removeRecord } = useDbService();

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
    let userRecord: AuthStoreRecord = {
      user: username,
      password,
      isAuth: true,
    };
    putRecord(AUTH_STORE_NAME, userRecord);
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
    removeRecord(AUTH_STORE_NAME, { user: authState.authUser });
    localStorage.removeItem(AUTH_KEY);
    return errAsync(new AuthServiceError('NoAuthUser'));
  }
  setAuthState('isLoading', false);
  return okAsync();
}
