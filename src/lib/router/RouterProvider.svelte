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

        if (window.location.pathname !== dst) {
            if (replace) {
                console.log('Replacing');
                window.history.replaceState(
                    { previousLocation, currentLocation },
                    '',
                    currentLocation
                );
            } else {
                console.log('Adding');
                window.history.pushState(
                    { previousLocation, currentLocation },
                    '',
                    currentLocation
                );
            }
        }
    }

    /// Handle `back` navigation
    window.addEventListener('popstate', (e) => {
        if (e.state) {
            navigateTo(e.state.previousLocation, true);
        } else {
            e.state.currentLocation
                ? navigateTo(e.state.currentLocation)
                : null;
        }
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
