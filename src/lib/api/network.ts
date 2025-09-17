import { invoke } from '@tauri-apps/api/core';

/** Creates a new network endpoint for the user. */
export async function createEndpoint(userId: number) {
  try {
    await invoke('create_new_endpoint', { userId });
  } catch (e: any) {
    throw new Error(e);
  }
}
