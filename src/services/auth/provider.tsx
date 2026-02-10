import { AuthError, AuthService, AuthState } from '@/services/auth/service';
import { DBService, UserRecord } from '@/services/database/service';
import { createStore } from 'solid-js/store';
import {
  useIndexDB,
  USERS_STORE_NAME,
} from '@/services/database/indexDBProvider';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import { useLogger } from '../logger/provider';
import { createAsync } from '@solidjs/router';
import { Component, createContext, useContext } from 'solid-js';

/** Loads the authentication state from the database. */
async function loadAuthState<DB>(db: DBService<DB>) {
  const logger = useLogger();
  if (!db.state.isReady) {
    return null;
  }

  logger.info('Loading authentication state');
  return await db
    .readAllRecords<UserRecord>(USERS_STORE_NAME)
    .andThen((userRecords) => {
      return okAsync(userRecords.find((record) => record.isAuth)).map((e) =>
        e ? e : null
      );
    })
    .mapErr((e) => ({
      kind: 'Loading State Failed',
      message: 'Unable to read authentication state from database',
      info: { e },
    }))
    .match(
      (authUser) => {
        logger.info('Authentication state loaded');
        return authUser;
      },
      (err) => {
        logger.error(err.kind, err.message, err.info);
        return null;
      }
    );
}

/** Initalizes the authentication service provider. */
async function initAuthProvider(): Promise<AuthService> {
  const db = useIndexDB();
  const authUser = await loadAuthState(db);

  const [state, setState] = createStore<AuthState>({
    user: authUser ? { id: authUser.id, name: authUser.username } : null,
    isReady: true,
  });

  /** Authenticates the given login. */
  function authenticate(
    username: string,
    password: string
  ): ResultAsync<void, AuthError> {
    setState('isReady', false);
    return db
      .readRecord<UserRecord, string>(USERS_STORE_NAME, username)
      .andThen((user) => {
        // If passwords match, authenticate
        if (user !== null && password === user.password) {
          const authUser = { id: user.id, name: user.username };
          setState('user', authUser);

          // Update DB record
          return db
            .updateRecord<UserRecord, string>(USERS_STORE_NAME, username, {
              ...user,
              isAuth: true,
            })
            .andTee(() => setState('isReady', true))
            .mapErr((e) => ({
              kind: 'Authentication Failed',
              message: 'Unable to update auth user in database',
              info: { e },
            }));
        }

        // Passwords don't match
        setState('isReady', true);
        return errAsync({
          kind: 'Invalid Login',
          message: 'The username and password were not found',
          info: {
            database: db.state.name,
            version: db.state.name,
            table: USERS_STORE_NAME,
          },
        });
      })
      .andTee(() => setState('isReady', true));
  }

  /** Unauthenticate the currently authenticated user. */
  // : ResultAsync<void, AuthError>
  function unauthenticate() {
    setState('isReady', false);

    // Return if no auth user
    if (state.user === null) {
      setState('isReady', true);
      return okAsync();
    }

    // Remove auth from user in DB
    return db
      .readRecord<UserRecord, string>(USERS_STORE_NAME, state.user.name)
      .andThen((user) =>
        user
          ? db.updateRecord<UserRecord, string>(
              USERS_STORE_NAME,
              state.user?.name || user.username,
              {
                ...user,
                isAuth: false,
              }
            )
          : errAsync({
              kind: 'Unauthentication Failed',
              message:
                'The user to unauthenticate was not found in the database',
              info: {
                database: db.state.name,
                version: db.state.version,
                table: USERS_STORE_NAME,
                username: state.user?.name,
              },
            })
      )
      .andTee(() => setState('isReady', true));
  }

  return {
    state,
    authenticate,
    unauthenticate,
  };
}

// --------Context Provider-------- //
// -------------------------------- //

const AuthContext = createContext<AuthService>();

/** Provides the context for the database service. */
export const AuthProvider: Component<{ children: any }> = (props) => {
  const db = createAsync(initAuthProvider);

  return (
    <AuthContext.Provider value={db()}>{props.children}</AuthContext.Provider>
  );
};

/** Hook to use the indexDB database service. */
export function useAuth() {
  const db = useContext(AuthContext);
  if (!db) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return db;
}
