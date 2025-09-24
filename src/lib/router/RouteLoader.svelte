<script module>
  export function conditionsFailed(event: RouterEvent<{ location: string }>) {
    // Navigate to login if not authenticated
    if (event.detail.location === '/') {
      replace('/login');
    }
  }

  export function routeLoaded(event: RouterEvent<{ location: string }>) {
    // Navigate to dashboard if authenticated
    if (event.detail.location === '/') {
      replace('/dashboard');
    }
  }
</script>

<script lang="ts">
  import { getContext } from 'svelte';
  import { replace, type RouterEvent } from 'svelte-spa-router';
  import type { AuthContext } from '@/auth/types';
  import { authContextKey } from '@/auth/authContextKey';

  const { children } = $props();

  const { isLoading } = getContext<AuthContext>(authContextKey);
  const loading = $derived(isLoading());

  /** Waits for authentication. */
  export async function waitForAuth() {
    while (loading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  $effect.pre(() => {
    waitForAuth();
  });
</script>

{@render children()}
