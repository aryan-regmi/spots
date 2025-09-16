<script lang="ts">
    import { getContext, onMount } from 'svelte';
    import type { NavContext, Route } from './types';
    import type { AuthContext } from '@/auth/types';
    import LoadingPage from '@/pages/loading/LoadingPage.svelte';

    // Get routes as props
    let { routes }: { routes: Route[] } = $props();

    // Get the navigation context.
    let { getLocation, navigateTo } = getContext<NavContext>('navContext');

    // Route to landing page based on authentication state
    onMount(() => {
        if (!location) {
            if (isAuthenticated()) {
                navigateTo('/dashboard');
            } else {
                navigateTo('/login');
            }
        }
    });

    /** The current path. */
    const location = $derived.by(() => getLocation());

    /** The current component being displayed. */
    const currentComponent = $derived.by(() => {
        let route = routes.find((route) => route.path == location);
        return route ? route.component : LoadingPage;
    });

    // Function to check if session is authenticated or not.
    const { isAuthenticated } = getContext<AuthContext>('authContext');
</script>

<svelte:boundary>
    {@const Component = currentComponent}
    <Component />
</svelte:boundary>
