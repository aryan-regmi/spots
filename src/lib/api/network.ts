import { createMutation } from '@tanstack/svelte-query';
import { invoke } from '@tauri-apps/api/core';

/** Creates a new network endpoint for the user. */
async function createEndpoint(userId: number) {
  try {
    await invoke('create_new_endpoint', { userId });
  } catch (e: any) {
    throw new Error(e);
  }
}

/** Mutation to create a new network endpoint. */
export function createEndpointMutation() {
  return createMutation({
    mutationKey: ['createEndpoint'],
    mutationFn: createEndpoint,
  });
}
