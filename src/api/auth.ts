import {
  LoginUserDto,
  LoginUserResponseDto,
  RegisterUserDto,
} from '@/api/dtos';
import { invoke } from '@tauri-apps/api/core';
import { ApiErrorResponse, ApiResponse } from './utils';
import { errAsync, ResultAsync } from 'neverthrow';
import { useStore } from '@/utils/tauriStore';

function registerUser(user: RegisterUserDto) {
  const callBackend = ResultAsync.fromPromise(
    registerUserBackend(user),
    (err) => err as ApiErrorResponse
  );
}

function loginUser(user: LoginUserDto) {
  const storeCtx = useStore();
  if (storeCtx === undefined || storeCtx.store() === undefined) {
    return errAsync({
      status: 'Failure',
      value: 'Store must be initalized',
    } as ApiErrorResponse);
  }
  const store = storeCtx.store()!;

  // Calls the rust command
  const callBackend = ResultAsync.fromPromise(
    loginUserBackend(user),
    (err) => err as ApiErrorResponse
  );

  // Gets the `LoginUserResponseDto` from the response
  const extractResponse = (res: ApiResponse<LoginUserResponseDto>) => {
    if (res.status !== 'Success') {
      return {
        status: 'Failure',
        value: '`login_user` returned an invalid response',
      } as ApiErrorResponse;
    }
    return res.value;
  };

  // Sets the auth token and user ID in the store
  const setAuthToken = (data: LoginUserResponseDto) => {
    return storeCtx
      .setValue(store, {
        key: 'auth-token',
        value: data.token,
      })
      .andThen(() =>
        storeCtx.setValue(store, { key: 'auth-user-id', value: data.user.id })
      );
  };

  // TODO: finish
}

// TODO: Add logout
//  - Remember to unset store values!

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
