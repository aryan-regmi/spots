import type { User } from '@/user/types';
import {
  createMutation,
  createQuery,
  QueryClient,
} from '@tanstack/svelte-query';
import { invoke } from '@tauri-apps/api/core';

/** Sets the authenticated user. */
async function setAuthUser(user: User) {
  try {
    await invoke('set_auth_user', { user });
    console.info('Auth user updated in database:', user);
  } catch (e: any) {
    throw new Error(e);
  }
}

/** Mutation to set the authenticated user. */
export function setAuthUserMutation(queryClient: QueryClient) {
  return createMutation({
    mutationKey: ['setAuthUser'],
    mutationFn: setAuthUser,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['getAuthUser'] }),
  });
}

/** Removes the authenticated user. */
async function removeAuthUser() {
  try {
    await invoke('remove_auth_user');
    console.info('Auth user removed in database');
  } catch (e: any) {
    throw new Error(e);
  }
}

/** Mutation to remove the authenticated user. */
export function removeAuthUserMutation(queryClient: QueryClient) {
  return createMutation({
    mutationKey: ['removeAuthUser'],
    mutationFn: removeAuthUser,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['getAuthUser'] }),
  });
}

/** Gets the currently authenticated user. */
async function getAuthUser() {
  try {
    const user = await invoke<User | null>('get_auth_user');
    console.info('Auth user retrieved from database:', user);
    return user;
  } catch (e: any) {
    throw new Error(e);
  }
}

/** Query to get the authenticated user. */
export function getAuthUserQuery() {
  return createQuery({
    queryKey: ['getAuthUser'],
    queryFn: getAuthUser,
  });
}
