import { ResultAsync } from 'neverthrow';
import { ServiceError } from '@/services/utils/error';

/** The error returned from an authentication service. */
export class AuthError extends Error implements ServiceError {
  constructor(kind: string, message: string, info?: any) {
    super();
    super.name = 'AuthError';
    super.message = message;
    this.kind = kind;
    this.info = info;
  }
  kind: string;
  info?: any;
}

/** The authentication service. */
export interface AuthService {
  /** Gets the currently authenticated user. */
  getAuthUser: () => ResultAsync<string | null, AuthError>;

  /** Validates the login. */
  validateLogin: (
    username: string,
    password: string
  ) => ResultAsync<boolean, AuthError>;

  /** Authenticates the user. */
  authenticate: (username: string) => ResultAsync<void, AuthError>;

  /** Unauthenticates the currently authenticated session. */
  unauthenticate: () => ResultAsync<void, AuthError>;

  /** Creates a new login. */
  createLogin: (
    username: string,
    password: string
  ) => ResultAsync<void, AuthError>;
}
