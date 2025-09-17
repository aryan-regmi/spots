<script lang="ts">
  import type { NavContext } from '@/router/types';
  import { setContext } from 'svelte';

  const { children } = $props();

  $effect(() => {
    // Store current path on initial load
    window.history.replaceState({ path: currentLocation }, '', currentLocation);

    // Handle back/forward buttons
    const handlePopstate = (event: PopStateEvent) => {
      const path = event.state?.path || window.location.pathname;
      currentLocation = path;
    };
    window.addEventListener('popstate', handlePopstate);

    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  });

  /** The current page being displayed. */
  let currentLocation = $state<string>();

  /** Navigates to the specified path. */
  async function navigateTo(dest: string, options?: { replace?: boolean }) {
    if (dest === currentLocation) return;

    if (options?.replace) {
      window.history.replaceState({ path: dest }, '', dest);
      window.history.pushState({ path: dest }, '', dest);
    } else {
      window.history.pushState({ path: dest }, '', dest);
    }
    currentLocation = dest;
  }

  // Set the navigation context.
  setContext<NavContext>('navContext', {
    navigateTo,
    getLocation: () => currentLocation,
    setLocation: async (path: string) => {
      currentLocation = path;
    },
  });
</script>

{@render children()}
