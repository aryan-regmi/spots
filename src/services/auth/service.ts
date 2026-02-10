import { ResultAsync } from 'neverthrow';

/** The error returned from an authentication service. */
export type AuthError = {
  kind?: string;
  message: string;
  info?: any;
};

/** Represents a user. */
export interface User {
  /** Id of the user. */
  id: string;

  /** Name of the user. */
  name: string;
}

/** The state for the authentication service. */
export interface AuthState {
  /** The authenticated user. */
  user: User | null;

  /** If the state is ready (no auth operations being done). */
  isReady: boolean;
}

/** Defines the interface for the authentication service. */
export interface AuthService {
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
