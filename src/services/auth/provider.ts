import { AuthError, AuthService } from '@/services/auth/service';
import { action } from '@solidjs/router';
import { invoke } from '@tauri-apps/api/core';
import { ResultAsync } from 'neverthrow';

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

  authenticate(username: string): ResultAsync<void, AuthError> {
    return ResultAsync.fromPromise(
      this.authenticateLoginBackend(username),
      (err) => err as AuthError
    );
  }

  unauthenticate(): ResultAsync<void, AuthError> {
    return ResultAsync.fromPromise(
      this.unauthenticateLoginBackend(),
      (err) => err as AuthError
    );
  }

  /** The action that invokes the backend validation function. */
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

  /** The action that invokes the backend authentication function. */
  private authenticateLoginBackend = async (username: string) => {
    try {
      return await invoke<void>('authenticate_login', {
        username,
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

  /** The action that invokes the backend unauthentication function. */
  private unauthenticateLoginBackend = async () => {
    try {
      return await invoke<void>('uauthenticate_login', {});
    } catch (e) {
      const error = e as Error;
      throw new AuthError(
        'UnauthenticationFailed',
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
    (username: string) =>
      auth.authenticate(username).match(
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
