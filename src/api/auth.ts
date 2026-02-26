import {
  LoginUserDto,
  LoginUserResponseDto,
  RegisterUserDto,
} from '@/api/dtos';
import { invoke } from '@tauri-apps/api/core';
import { ApiError, ApiResponse } from './utils';
import { errAsync, okAsync, Result, ResultAsync } from 'neverthrow';
import { StoreContext, useStore } from '@/utils/tauriStore';
import { action, redirect } from '@solidjs/router';
import { SpotsError } from '@/utils/errors';

export const AUTH_TOKEN_KEY = 'auth-token';
export const AUTH_USERID_KEY = 'auth-user-id';

/** Action to register a user, given register user form data. */
export const registerUserAction = action(
  async (storeCtx: StoreContext, registerFormData: FormData) => {
    const username = registerFormData.get('username')?.toString();
    const password = registerFormData.get('password')?.toString();
    const passwordConfirm = registerFormData.get('passwordConfirm')?.toString();
    if (!username || !password || !passwordConfirm) {
      return errAsync<void | string, SpotsError | ApiError>({
        kind: 'InvalidCredentials',
        message:
          '`username`, `password`, and `passwordConfirm` must not be empty',
        _tag: '_SpotsError',
      });
    }

    const user: RegisterUserDto = { username, password, passwordConfirm };
    const result = await registerUser(user, storeCtx);

    // Redirects to the user's dashboard.
    if (result.isOk()) {
      const user_id = result.value;
      window.history.replaceState(null, '', `/user/${user_id}/dashboard`);
      throw redirect(`/user/${user_id}/dashboard`);
    } else {
      return result as Result<void | string, SpotsError | ApiError>;
    }
  },
  'registerUser'
);

/** Action to login a user, given login user form data. */
export const loginUserAction = action(
  async (storeCtx: StoreContext, loginFormData: FormData) => {
    const username = loginFormData.get('username')?.toString();
    const password = loginFormData.get('password')?.toString();
    if (!username || !password) {
      return errAsync<void | string, SpotsError | ApiError>({
        kind: 'InvalidCredentials',
        message: '`username` and `password` must not be empty',
        _tag: '_SpotsError',
      });
    }

    const user: LoginUserDto = { username, password };
    const result = await loginUser(user, storeCtx);

    // Redirects to the user's dashboard.
    if (result.isOk()) {
      const user_id = result.value;
      window.history.replaceState(null, '', `/user/${user_id}/dashboard`);
      throw redirect(`/user/${user_id}/dashboard`);
    }

    return result as Result<void | string, SpotsError | ApiError>;
  },
  'loginUser'
);

/** Action to logout the currently authenticated user. */
export const logoutUserAction = action(async () => {
  const storeCtx = useStore();
  const result = await logoutUser(storeCtx);

  // Redirects to the login page
  if (result.isOk()) {
    window.history.replaceState(null, '', '/');
    throw redirect(`/`);
  }

  return result;
});

/** Registers the user then logs them in. */
function registerUser(user: RegisterUserDto, storeCtx: StoreContext) {
  // Calls the rust command
  const callBackend = ResultAsync.fromPromise(
    invoke<ApiResponse<void>>('register_user', { user }),
    (err) => err as ApiError
  );

  // Logs the new user in
  const login = () => {
    let login_user: LoginUserDto = user;
    return loginUser(login_user, storeCtx);
  };

  return callBackend.andThen(login);
}

/** Authenticates the user then updates the store with the auth token. */
function loginUser(user: LoginUserDto, storeCtx: StoreContext) {
  // Calls the rust command
  const callBackend = ResultAsync.fromPromise(
    invoke<ApiResponse<LoginUserResponseDto>>('login_user', {
      user,
    }),
    (err) => err as ApiError
  );

  // Gets the `LoginUserResponseDto` from the response
  const extractResponse: (
    res: ApiResponse<LoginUserResponseDto>
  ) => ResultAsync<LoginUserResponseDto, SpotsError | ApiError> = (res) => {
    if (res.status !== 'Success') {
      return errAsync({
        kind: 'ApiRequestFailed',
        message: 'The API responded with a `Failure`',
        info: res.value,
        _tag: '_SpotsError',
      });
    }
    return okAsync(res.value);
  };

  // Sets the auth token and user ID in the store
  const setAuthToken = (data: LoginUserResponseDto) => {
    return storeCtx.openStore().andThen((store) =>
      ResultAsync.combine([
        storeCtx.addEntry(store, {
          key: AUTH_TOKEN_KEY,
          value: data.token,
        }),
        storeCtx.addEntry(store, {
          key: AUTH_USERID_KEY,
          value: data.user.id,
        }),
      ]).andThen(() => storeCtx.saveStore(store))
    );
  };

  return callBackend.andThen(extractResponse).andThen(setAuthToken);
}

/** Unauthenticates the logged in user. */
function logoutUser(storeCtx: StoreContext) {
  // Remove auth entries from store, then save it
  return storeCtx
    .openStore()
    .andThen((store) =>
      ResultAsync.combine([
        storeCtx.removeEntry(store, AUTH_TOKEN_KEY),
        storeCtx.removeEntry(store, AUTH_USERID_KEY),
      ]).andThen(() => storeCtx.saveStore(store))
    );
}
