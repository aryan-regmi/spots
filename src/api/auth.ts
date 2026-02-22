import {
  LoginUserDto,
  LoginUserResponseDto,
  RegisterUserDto,
} from '@/api/dtos';
import { invoke } from '@tauri-apps/api/core';
import { ApiErrorResponse, ApiResponse } from './utils';
import { errAsync, okAsync, Result, ResultAsync } from 'neverthrow';
import { StoreInnerContext, useStore } from '@/utils/tauriStore';
import { action, redirect } from '@solidjs/router';
import { createError, SpotsError } from '@/utils/errors';

export const AUTH_TOKEN_KEY = 'auth-token';
export const AUTH_USERID_KEY = 'auth-user-id';

/** Errors returned by the auth API. */
export type AuthAPIError =
  | {
      InvalidRegisterUserFormData: 'The register user form must have `username`, `password`, and `passwordConfirm` fields';
    }
  | {
      InvalidLoginUserFormData: 'The login user form must have `username` and `password` fields';
    }
  | { RegisterUserError: 'Unable to register user' }
  | { LoginUserError: 'Unable to login user' };

/** Action to register a user, given register user form data. */
export const registerUserAction = action(async (registerFormData: FormData) => {
  const storeCtx = useStore();

  const username = registerFormData.get('username')?.toString();
  const password = registerFormData.get('password')?.toString();
  const passwordConfirm = registerFormData.get('passwordConfirm')?.toString();
  if (!username || !password || !passwordConfirm) {
    return errAsync<void, SpotsError>(
      createError({
        InvalidRegisterUserFormData:
          'The register user form must have `username`, `password`, and `passwordConfirm` fields',
      })
    );
  }

  const user: RegisterUserDto = { username, password, passwordConfirm };
  const result = await registerUser(user, storeCtx).mapErr((e) => {
    if (typeof e === 'object' && 'status' in e) {
      const err = e as ApiErrorResponse;
      return createError(
        { RegisterUserError: 'Unable to register user' },
        { status: err.status, error: err.value }
      );
    } else {
      const err = e as SpotsError;
      return err;
    }
  });

  // Redirects to the user's dashboard.
  if (result.isOk()) {
    const user_id = result.value;
    throw redirect(`/user/${user_id}/dashboard`);
  }

  return result as Result<void | string, SpotsError>;
}, 'registerUser');

/** Action to login a user, given login user form data. */
export const loginUserAction = action(
  async (storeCtx: StoreInnerContext, loginFormData: FormData) => {
    const username = loginFormData.get('username')?.toString();
    const password = loginFormData.get('password')?.toString();
    if (!username || !password) {
      return errAsync<void, SpotsError>(
        createError({
          InvalidLoginUserFormData:
            'The login user form must have `username` and `password` fields',
        })
      );
    }

    const user: LoginUserDto = { username, password };
    const result = await loginUser(user, storeCtx);

    // Redirects to the user's dashboard.
    if (result.isOk()) {
      const user_id = result.value;
      throw redirect(`/user/${user_id}/dashboard`);
    }

    return result as Result<void | string, SpotsError>;
  },
  'loginUser'
);

/** Action to logout the currently authenticated user. */
export const logoutUserAction = action(async () => {
  const storeCtx = useStore();
  const result = await logoutUser(storeCtx);

  // Redirects to the login page
  if (result.isOk()) {
    throw redirect(`/`);
  }

  return result;
});

/** Registers the user then logs them in. */
function registerUser(user: RegisterUserDto, storeCtx: StoreInnerContext) {
  // Calls the rust command
  const callBackend = ResultAsync.fromPromise(
    registerUserBackend(user),
    (err) => err as ApiErrorResponse
  );

  // Logs the new user in
  const login = () => {
    let login_user: LoginUserDto = user;
    return loginUser(login_user, storeCtx);
  };

  return callBackend.andThen(login);
}

/** Authenticates the user then updates the store with the auth token. */
function loginUser(user: LoginUserDto, storeCtx: StoreInnerContext) {
  if (storeCtx === undefined || storeCtx.store() === undefined) {
    return errAsync(createError({ InvalidStore: 'Store must be initalized' }));
  }
  const store = storeCtx.store()!;

  // Calls the rust command
  const callBackend = ResultAsync.fromPromise(
    loginUserBackend(user),
    (err) => err as ApiErrorResponse
  ).mapErr((err) =>
    createError(
      { LoginUserError: 'Unable to login user' },
      { error: err.value }
    )
  );

  // Gets the `LoginUserResponseDto` from the response
  const extractResponse = (res: ApiResponse<LoginUserResponseDto>) => {
    if (res.status !== 'Success') {
      return errAsync(
        createError(
          { LoginUserError: 'Unable to login user' },
          { error: res.value }
        )
      );
    }
    return okAsync<LoginUserResponseDto, SpotsError>(res.value);
  };

  // Sets the auth token and user ID in the store
  const setAuthToken = (data: LoginUserResponseDto) => {
    return storeCtx
      .addEntry(store, {
        key: AUTH_TOKEN_KEY,
        value: data.token,
      })
      .andThen(() => {
        storeCtx.addEntry(store, {
          key: AUTH_USERID_KEY,
          value: data.user.id,
        });
        return okAsync(data.user.id);
      });
  };

  return callBackend
    .map(extractResponse)
    .andThen((data) => data.andThen(setAuthToken));
}

/** Unauthenticates the logged in user. */
function logoutUser(storeCtx: StoreInnerContext) {
  if (storeCtx === undefined || storeCtx.store() === undefined) {
    return errAsync(createError({ InvalidStore: 'Store must be initalized' }));
  }
  const store = storeCtx.store()!;

  // Remove auth entries from store
  storeCtx.removeEntry(store, AUTH_TOKEN_KEY);
  storeCtx.removeEntry(store, AUTH_USERID_KEY);

  return okAsync<void, SpotsError>();
}

/** Calls the backend `login_user` command. */
async function loginUserBackend(user: LoginUserDto) {
  try {
    return await invoke<ApiResponse<LoginUserResponseDto>>('login_user', {
      user,
    });
  } catch (e) {
    const err = e as ApiErrorResponse;
    throw err;
  }
}

/** Calls the backend `register_user` command. */
async function registerUserBackend(user: RegisterUserDto) {
  try {
    return await invoke<ApiResponse<void>>('register_user', { user });
  } catch (e) {
    const err = e as ApiErrorResponse;
    throw err;
  }
}
