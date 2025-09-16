<script lang="ts">
    import type { NavContext } from '@/router/types';
    import { setContext } from 'svelte';

    const { children } = $props();

    /** The current page being displayed. */
    let currentLocation = $state<string>();

    /** The previous page being displayed. */
    let previousLocation = $state<string>();

    /** Navigates to the specified path. */
    async function navigateTo(dst: string, replace?: boolean) {
        currentLocation = dst;
        previousLocation = window.location.pathname;

        if (replace || window.location.pathname === dst) {
            console.log('Replacing history');
            window.history.replaceState(
                { previous: previousLocation },
                '',
                currentLocation
            );
        } else {
            console.log('Adding to history');
            window.history.pushState(
                { previous: previousLocation },
                '',
                currentLocation
            );
        }
    }

    /// Handle `back` navigation
    window.addEventListener('popstate', (e) => {
        if (e.state) {
            navigateTo(e.state.previous);
        }
        // currentLocation = e.state ? e.state.path : currentLocation;
    });

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
