import type { User } from '@/user/types';
import { invoke } from '@tauri-apps/api/core';

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
      userId,
      password,
    });
  } catch (e: any) {
    throw new Error(e);
  }
}

/** Inserts a new user into the database. */
export async function insertUser(username: string, password: string) {
  try {
    return await invoke<User>('insert_user', { username, password });
  } catch (e: any) {
    throw new Error(e);
  }
}

/** Gets the user with the specified username from the database. */
export async function getUserByUsername(username: string) {
  try {
    return await invoke<User | undefined>('get_user_by_username', {
      username,
    });
  } catch (e: any) {
    throw new Error(e);
  }
}

/** Gets the user with the specified ID from the database. */
export async function getUserById(id: number) {
  try {
    return await invoke<User | undefined>('get_user_by_id', { id });
  } catch (e: any) {
    throw new Error(e);
  }
}
