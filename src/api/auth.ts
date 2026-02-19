import {
  LoginUserDto,
  LoginUserResponseDto,
  RegisterUserDto,
} from '@/api/dtos';
import { invoke } from '@tauri-apps/api/core';
import { ApiErrorResponse, ApiResponse } from './utils';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import { useStore } from '@/utils/tauriStore';
import { action, redirect } from '@solidjs/router';
import { SpotsError } from '@/utils/errors';

export const AUTH_TOKEN_KEY = 'auth-token';
export const AUTH_USERID_KEY = 'auth-user-id';

export const registerUserAction = action(async (registerFormData: FormData) => {
  const username = registerFormData.get('username')?.toString();
  const password = registerFormData.get('password')?.toString();
  const passwordConfirm = registerFormData.get('passwordConfirm')?.toString();
  if (!username || !password || !passwordConfirm) {
    return errAsync<void, SpotsError>({
      kind: 'InvalidFormData',
      message:
        'The form must have `username`, `password`, and `passwordConfirm` fields',
    } as SpotsError);
  }

  const user: RegisterUserDto = { username, password, passwordConfirm };
  return registerUser(user).mapErr(
    (e) => {
      let err = errAsync(e);
    }
    // ({
    //   kind: 'RegisterUserFailed',
    //   message: `${JSON.stringify(e)}`,
    // }) as SpotsError
  );
}, 'registerUser');

function registerUser(user: RegisterUserDto) {
  // Calls the rust command
  const callBackend = ResultAsync.fromPromise(
    registerUserBackend(user),
    (err) => err as ApiErrorResponse
  );

  // Logs the new user in
  const loginAndRedirect = () => {
    let login_user: LoginUserDto = user;
    return loginUser(login_user);
  };

  return callBackend.andThen(() => loginAndRedirect());
}

function loginUser(user: LoginUserDto) {
  const storeCtx = useStore();
  if (storeCtx === undefined || storeCtx.store() === undefined) {
    return errAsync({
      kind: 'InvalidStore',
      message: 'Store must be initalized',
    } as SpotsError);
  }
  const store = storeCtx.store()!;

  // Calls the rust command
  const callBackend = ResultAsync.fromPromise(
    loginUserBackend(user),
    (err) => err as ApiErrorResponse
  ).mapErr(
    (err) =>
      ({
        kind: 'LoginUserFailed',
        message: `${JSON.stringify(err)}`,
      }) as SpotsError
  );

  // Gets the `LoginUserResponseDto` from the response
  const extractResponse = (res: ApiResponse<LoginUserResponseDto>) => {
    if (res.status !== 'Success') {
      return errAsync({
        kind: 'ResponseExtractionFailed',
        message: '`login_user` returned an invalid response',
        info: res.value,
      } as SpotsError);
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
        storeCtx.addEntry(store, { key: AUTH_USERID_KEY, value: data.user.id });
        return okAsync(data.user.id);
      });
  };

  // Redirects to the user's dashboard.
  const redirectToDashboard = (user_id: string) => {
    redirect(`/user/${user_id}/dashboard`);
    return okAsync();
  };

  return callBackend
    .map(extractResponse)
    .andThen((data) => data.andThen(setAuthToken))
    .andThen(redirectToDashboard)
    .mapErr((e) => e as SpotsError);
}

function logoutUser() {
  const storeCtx = useStore();
  if (storeCtx === undefined || storeCtx.store() === undefined) {
    return errAsync({
      kind: ""
      message: 'Store must be initalized',
    } as SpotsError);
  }
  const store = storeCtx.store()!;
  storeCtx.removeEntry(store, AUTH_TOKEN_KEY);
  storeCtx.removeEntry(store, AUTH_USERID_KEY);
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
