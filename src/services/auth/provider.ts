import { AuthError, AuthService } from '@/services/auth/service';
import { action } from '@solidjs/router';
import { invoke } from '@tauri-apps/api/core';
import { errAsync, ResultAsync } from 'neverthrow';

/** Provides the auth service by calling backend functions. */
class AuthProvider implements AuthService {
  validateLogin(
    username: string,
    password: string
  ): ResultAsync<boolean, AuthError> {
    const isValid = this.validateLoginBackend(username, password);
    return ResultAsync.fromPromise<boolean | undefined, AuthError>(
      isValid,
      (err) => err as AuthError
    ).map((b) => (b ? b : false));
  }

  authenticate(
    username: string,
    password: string
  ): ResultAsync<void, AuthError> {
    return ResultAsync.fromPromise(
      this.authenticateLoginBackend(username, password),
      (err) => err as AuthError
    );
  }

  unauthenticate(): ResultAsync<void, AuthError> {
    return errAsync(new AuthError('NotImplemented', 'NotImplemented'));
  }

  /** The query that invokes the backend validation function. */
  private validateLoginBackend = async (username: string, password: string) => {
    try {
      return await invoke<boolean>('validate_login', {
        username,
        password,
      });
    } catch (e) {
      const error = e as Error;
      throw new AuthError(
        'ValidationFailed',
        'Backend function returned with an error',
        error
      );
    }
  };

  /** The query that invokes the backend authentication function. */
  private authenticateLoginBackend = async (
    username: string,
    password: string
  ) => {
    try {
      return await invoke<void>('authenticate_login', {
        username,
        password,
      });
    } catch (e) {
      const error = e as Error;
      throw new AuthError(
        'AuthenticationFailed',
        'Backend function returned with error',
        error
      );
    }
  };
}

/** Hooks to use the authentication service. */
export function useAuth() {
  const auth = new AuthProvider();
  const validateAction = action(
    (username: string, password: string) =>
      auth.validateLogin(username, password).match(
        (isValid) => isValid,
        (err) => err
      ),
    'validateLogin'
  );
  const authenticateAction = action(
    (username: string, password: string) =>
      auth.authenticate(username, password).match(
        (_ok) => {},
        (err) => err
      ),
    'authenticateLogin'
  );
  const unauthenticateAction = action(
    () =>
      auth.unauthenticate().match(
        (_ok) => {},
        (err) => err
      ),
    'unauthenticateLogin'
  );
  return {
    validateAction,
    authenticateAction,
    unauthenticateAction,
  };
}
