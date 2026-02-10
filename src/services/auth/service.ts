import { ResultAsync } from 'neverthrow';

/** The error returned from an authentication service. */
export type AuthError = {
  message: string;
  info?: any;
};

/** Defines the provider interface for the authentication service. */
export interface AuthServiceProvider {
  /** The authentication state. */
  state: AuthState;

  /** Authenticates the given login. */
  authenticate: (
    username: string,
    password: string
  ) => ResultAsync<void, AuthError>;

  /** Unauthenticate the currently authenticated user. */
  unauthenticate: () => ResultAsync<void, AuthError>;
}

/** Represents a user. */
interface User {
  /** Id of the user. */
  id: string;

  /** Name of the user. */
  name: string;
}

/** The state for the authentication service. */
interface AuthState {
  /** The authenticated user. */
  user: User | null;

  /** If the state is ready (no auth operations being done). */
  isReady: boolean;
}
