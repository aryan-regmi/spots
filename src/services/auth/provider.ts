import { AuthError, AuthService } from '@/services/auth/service';
import { action, query } from '@solidjs/router';
import { invoke } from '@tauri-apps/api/core';
import { ResultAsync } from 'neverthrow';
import * as Api from '@/services/utils/api';
import { useLogger } from '../logger/provider';
import * as uuid from 'uuid';

/** Provides the auth service by calling backend functions. */
class AuthProvider implements AuthService {
  private logger = useLogger();

  getAuthUser(): ResultAsync<string | null, AuthError> {
    return ResultAsync.fromPromise(
      this.getAuthUserBackend(),
      (err) => err as AuthError
    );
  }

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

  createLogin(
    username: string,
    password: string
  ): ResultAsync<void, AuthError> {
    return ResultAsync.fromPromise(
      this.createLoginBackend(username, password),
      (err) => err as AuthError
    );
  }

  /** Invokes the backend validation function. */
  private getAuthUserBackend = async () => {
    try {
      const resp = await invoke<Api.Response<string | null>>(
        'get_auth_user',
        {}
      );
      if (resp.success) {
        return resp.value;
      }
      this.logger.warn(`Invalid response: ${resp}`);
      return null;
    } catch (e) {
      const error = e as Api.ErrorResponse;
      throw new AuthError('GetAuthUserFailed', error.value.message);
    }
  };

  /** Invokes the backend validation function. */
  private validateLoginBackend = async (username: string, password: string) => {
    try {
      const resp = await invoke<Api.Response<boolean>>('validate_login', {
        username,
        password,
      });
      if (resp.success) {
        return resp.value;
      }
      this.logger.warn(`Invalid response: ${resp}`);
      return false;
    } catch (e) {
      const error = e as Api.ErrorResponse;
      throw new AuthError('ValidationFailed', error.value.message);
    }
  };

  /** Invokes the backend authentication function. */
  private authenticateLoginBackend = async (username: string) => {
    try {
      const resp = await invoke<Api.Response<void>>('authenticate_login', {
        username,
      });
      if (resp.success) {
        return resp.value;
      }
      this.logger.warn(`Invalid response: ${resp}`);
    } catch (e) {
      const error = e as Api.ErrorResponse;
      throw new AuthError('AuthenticationFailed', error.value.message);
    }
  };

  /** Invokes the backend unauthentication function. */
  private unauthenticateLoginBackend = async () => {
    try {
      const resp = await invoke<Api.Response<void>>('uauthenticate_login', {});
      if (resp.success) {
        return resp.value;
      }
      this.logger.warn(`Invalid response: ${resp}`);
    } catch (e) {
      const error = e as Api.ErrorResponse;
      throw new AuthError('UnauthenticationFailed', error.value.message);
    }
  };

  /** Invokes the backend create login function. */
  private createLoginBackend = async (username: string, password: string) => {
    try {
      const resp = await invoke<Api.Response<void>>('create_login', {
        userId: uuid.v1(),
        username,
        password,
      });
      if (resp.success) {
        return resp.value;
      }
      this.logger.warn(`Invalid response: ${resp}`);
    } catch (e) {
      const error = e as Api.ErrorResponse;
      throw new AuthError('CreateLoginFailed', error.value.message);
    }
  };
}

/** Hooks to use the authentication service. */
export function useAuth() {
  const auth = new AuthProvider();
  const getAuthUserQuery = query(async () => {
    const authUser = await auth.getAuthUser().match(
      (authUser) => authUser,
      (err) => err
    );
    return authUser;
  }, 'getAuthUser');
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
  const createLoginAction = action(
    (username: string, password: string) =>
      auth.createLogin(username, password).match(
        (_ok) => {},
        (err) => err
      ),
    'createLogin'
  );
  return {
    getAuthUserQuery,
    validateAction,
    authenticateAction,
    unauthenticateAction,
    createLoginAction,
  };
}
