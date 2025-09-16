<script lang="ts">
    import type { NavContext } from '@/router/types';
    import { onMount, setContext } from 'svelte';

    const { children } = $props();

    onMount(() => {
        // Store current path on initial load
        window.history.replaceState(
            { path: currentLocation },
            '',
            currentLocation
        );

        // Handle back/forward buttons
        window.addEventListener('popstate', (event) => {
            const path = event.state?.path || window.location.pathname;
            currentLocation = path;
        });
    });

    /** The current page being displayed. */
    let currentLocation = $state<string>();

    /** Navigates to the specified path. */
    async function navigateTo(dest: string, replace?: boolean) {
        if (dest === currentLocation) return;

        if (replace || window.location.pathname === dest) {
            console.log('replacing');
            window.history.replaceState({ dest }, '', dest);
        } else {
            console.log('pushing');
            window.history.pushState({ dest }, '', dest);
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
