import type { User } from '@/user/types';
import { createQuery } from '@tanstack/svelte-query';
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
