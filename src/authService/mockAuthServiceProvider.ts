import { AuthService, AuthenticationError } from '@/authService/authService';
import {
  AUTH_STORE_NAME,
  useDbService,
} from '@/dbService/mockDBServiceProvider';
import { errAsync, okAsync } from 'neverthrow';
import { createStore } from 'solid-js/store';

const { getRecord, getAllRecords, putRecord } = useDbService();

/** Provides the `AuthService`. */
export function useAuthService() {
  // Load authenticated user from the database
  const request = getAllRecords<AuthStoreRecordType>(AUTH_STORE_NAME);
  request.match(
    (data) => {
      const authUser = data.find((r) => r.isAuth);
      if (authUser) {
        setAuthState('authUser', authUser.username);
      }
    },
    (err) => console.error(`Failed to get user records: ${err.message}`)
  );

  return authState;
}

/** Type of records to insert into the database. */
type AuthStoreRecordType = {
  username: string;
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

/** Authenticates the specified user. */
function authenticate(username: string, password: string) {
  setAuthState('isLoading', true);

  // Check if the database has the given user
  let authenticated = getRecord<AuthStoreRecordType>(AUTH_STORE_NAME, username)
    .andThen((record) => {
      // Authenticate if username and password combo exists in the database
      if (password === record.password) {
        setAuthState('authUser', username);
        setAuthState('isLoading', false);
        putRecord<AuthStoreRecordType>(
          AUTH_STORE_NAME,
          {
            ...record,
            isAuth: true,
          },
          record.username
        );
        return okAsync();
      }

      // The stored password didn't match the given one
      setAuthState('isLoading', false);
      return errAsync(new AuthServiceError('InvalidLogin'));
    })
    .mapErr((e) => {
      console.error(`DBServiceError: ${e.message}`);
      const err = new AuthServiceError('InvalidLogin');
      return err;
    });

  return authenticated;
}

/** Unauthenticates the currently authenticated user. */
function unauthenticate() {
  setAuthState('isLoading', true);
  if (authState.authUser) {
    setAuthState('authUser', null);
    putRecord<AuthStoreRecordType>(AUTH_STORE_NAME, {
      username: authState.authUser,
      isAuth: false,
    });
    return errAsync(new AuthServiceError('NoAuthUser'));
  }
  setAuthState('isLoading', false);
  return okAsync();
}
