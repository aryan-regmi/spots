<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import type { NavContext, Route } from './types';
  import type { AuthContext } from '@/auth/types';
  import LoadingPage from '@/pages/loading/LoadingPage.svelte';

  let { routes }: { routes: Route[] } = $props();

  const {
    authState: { isAuthenticated },
  } = getContext<AuthContext>('authContext');
  const { getLocation, navigateTo } = getContext<NavContext>('navContext');

  // Route to landing page based on authentication state
  onMount(() => {
    let path;
    if (!location) {
      if (isAuthenticated) {
        path = '/dashboard';
        navigateTo(path, { replace: true });
      } else {
        path = '/login';
        navigateTo(path, { replace: true });
      }
    }

    // Only once, set initial history state
    if (!window.history.state || !window.history.state.path) {
      window.history.replaceState({ path }, '', path);
    }
  });

  /** The current path. */
  const location = $derived.by(() => getLocation());

  /** The current component being displayed. */
  const currentComponent = $derived.by(() => {
    let route = routes.find((route) => route.path == location);
    return route ? route.component : LoadingPage;
  });
</script>

<svelte:boundary>
  {@const Component = currentComponent}
  <Component />
</svelte:boundary>
