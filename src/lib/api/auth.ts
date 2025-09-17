import type { User } from '@/user/types';
import { invoke } from '@tauri-apps/api/core';

/** Sets the authenticated user. */
export async function setAuthUser(user: User) {
  try {
    await invoke('set_auth_user', { user });
  } catch (e: any) {
    throw new Error(e);
  }
}

/** Removes the authenticated user. */
export async function removeAuthUser() {
  try {
    await invoke('remove_auth_user');
  } catch (e: any) {
    throw new Error(e);
  }
}

/** Gets the currently authenticated user. */
export async function getAuthUser() {
  try {
    const user = await invoke<User | null>('get_auth_user');
    return user;
  } catch (e: any) {
    throw new Error(e);
  }
}
