import type { User } from '@/user/types';
import { createMutation, createQuery } from '@tanstack/svelte-query';
import { invoke } from '@tauri-apps/api/core';

/** Gets the user with the specified username from the database. */
async function getUserByUsername(username: string): Promise<User | undefined> {
  try {
    return await invoke<User | null>('get_user_by_username', { username });
  } catch (e: any) {
    throw new Error(e);
  }
}

/** Query to get the user associated with the specified username. */
export function getUserByUsernameQuery(username: string) {
  return createQuery({
    queryKey: ['getUserByUsername', username],
    queryFn: async () => await getUserByUsername(username),
    enabled: username.trim() !== '',
  });
}

/** Hashes the given password. */
export async function hashPassword(password: string) {
  try {
    return await invoke<string>('hash_password', { password });
  } catch (e: any) {
    throw new Error(e);
  }
}

/** Verifies the given password against the one stored in the database for the user. */
export async function verifyPassword(userId: number, password: string) {
  try {
    return await invoke<boolean>('verify_password', {
      user_id: userId,
      password,
    });
  } catch (e: any) {
    throw new Error(e);
  }
}
