import { ResultAsync } from 'neverthrow';

/** Error for authentication failure */
export interface AuthenticationError {
  message: string;
}

/** Service responsible for all authentication states and operations. */
export type AuthService = {
  /** The currently authenticated user. */
  authUser: string | null;

  /** Authenticates the specified login. */
  authenticate: (
    username: string,
    password: string
  ) => ResultAsync<void, AuthenticationError>;

  /** Unauthenticate the currently authenticated user. */
  unauthenticate: () => ResultAsync<void, AuthenticationError>;

  /** Determines if the authentication service is currently in a loading state. */
  isLoading: boolean;
};
