import { ResultAsync } from 'neverthrow';
import { ServiceError } from '@/services/utils/error';

/** The error returned from an authentication service. */
export class AuthError extends Error implements ServiceError {
  constructor(kind: string, message: string, info?: any) {
    super(message);
    this.kind = kind;
    this.message = message;
    this.info = info;
    this.name = 'AuthError';
  }
  name: string;
  kind: string;
  message: string;
  info?: any;
}

/** The authentication service. */
export interface AuthService {
  /** Validates the login. */
  validateLogin: (
    username: string,
    password: string
  ) => ResultAsync<boolean, AuthError>;

  /** Authenticates the login. */
  authenticate: (
    username: string,
    password: string
  ) => ResultAsync<void, AuthError>;

  /** Unauthenticates the currently authenticated session. */
  unauthenticate: () => ResultAsync<void, AuthError>;
}
