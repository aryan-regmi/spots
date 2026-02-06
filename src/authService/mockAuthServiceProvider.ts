import { createStore, produce } from 'solid-js/store';
import { AuthenticationError, AuthService } from './authService';
import { errAsync, okAsync } from 'neverthrow';
import {
  AUTH_STORE_NAME,
  useDBProvider,
} from '@/dbService/mockDBServiceProvider';
import { DBServiceError } from '@/dbService/dbService';

/** Auth store. */
const [authStore, setAuthStore] = createStore<AuthService>({
  authUser: null,
  isReady: false,
  authenticate: () => errAsync(new AuthenticationError('Not implemented')),
  unauthenticate: () => errAsync(new AuthenticationError('Not implemented')),
});

/** Initialize the DB. */
const db = useDBProvider();

/** Type of a record in the auth store (DB). */
type AuthStoreRecord = {
  username: string;
  password?: string;
  isAuth: boolean;
};

/** Loads auth state from DB. */
async function loadAuthState() {
  if (!db.isReady) {
    return;
  }

  setAuthStore('isReady', false);
  db.getAllRecords<AuthStoreRecord>(AUTH_STORE_NAME).match(
    (data) => {
      const authUser = data.find((record) => record.isAuth);
      if (authUser) {
        setAuthStore('authUser', authUser.username);
        setAuthStore('isReady', true);
      }
    },
    (err) => console.error('Failed to load auth state', err.message, err.info)
  );
}

/** Authenticates the given login. */
function authenticate(username: string, password: string) {
  setAuthStore('isReady', false);
  return db
    .getRecord<AuthStoreRecord>(AUTH_STORE_NAME, username) // Get record for the username from DB
    .andThen((record) => {
      // If passwords match, authenticate
      if (record && password === record.password) {
        setAuthStore('authUser', username);

        // Update DB record
        return db
          .putRecord<AuthStoreRecord>(
            AUTH_STORE_NAME,
            {
              ...record,
              isAuth: true,
            },
            record.username
          )
          .andTee(() => setAuthStore('isReady', true))
          .andThen(() => okAsync());
      }

      // No match found
      setAuthStore('isReady', true);
      return errAsync(new AuthenticationError('Invalid login'));
    })
    .mapErr((e) => {
      console.error(
        'DBError',
        e.message,
        e instanceof DBServiceError ? e.info : null
      );
      return new AuthenticationError('Invalid login');
    });
}

/** Unauthenticates the currently authenticated user. */
function unauthenticate() {
  setAuthStore('isReady', false);

  // Return if no auth user
  if (!authStore.authUser) {
    setAuthStore('isReady', true);
    return okAsync();
  }

  // Update DB (remove auth from user)
  return db
    .putRecord<AuthStoreRecord>(
      AUTH_STORE_NAME,
      { username: authStore.authUser, isAuth: false },
      authStore.authUser
    )
    .andTee(() => {
      setAuthStore('authUser', null);
      setAuthStore('isReady', true);
    })
    .andThen(() => okAsync());
}

/** Update store with actual imlementations. */
setAuthStore(
  produce((store) => {
    store.authenticate = authenticate;
    store.unauthenticate = unauthenticate;
  })
);

/** Returns the auth provider. */
export function useAuthProvider(): AuthService {
  return authStore;
}

loadAuthState();
