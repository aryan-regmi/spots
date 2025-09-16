<script lang="ts">
    import type { NavContext } from '@/router/types';
    import { setContext } from 'svelte';

    const { children } = $props();

    /** The current page being displayed. */
    let location = $state<string>();

    /** Navigates to the specified path. */
    async function navigateTo(path: string) {
        location = path;
    }

    // Set the navigation context.
    setContext<NavContext>('navContext', {
        navigateTo,
        getLocation: () => location,
        setLocation: async (path: string) => {
            location = path;
        },
    });
</script>

{@render children()}
