<script lang="ts">
    import { closeEndpoint } from '@/api/network';
    import type { AuthContext } from '@/auth/types';
    import Column from '@/components/Column.svelte';
    import type { NavContext } from '@/router/types';
    import { toCssString } from '@/utils/cssHelpers';
    import { stringToColour } from '@/utils/stringToColor';
    import { Avatar, Button, Popover } from 'bits-ui';
    import { getContext } from 'svelte';
    import MenuDrawer from './MenuDrawer.svelte';

    const { unauthorize } = getContext<AuthContext>('authContext');
    const { navigateTo } = getContext<NavContext>('navContext');

    /** Determines if currently in the process of running out. */
    let isLoggingOut = $state(false);

    /** Unauthenticates the user, closes the network endpoint and returns to the landing page. */
    async function logout() {
        isLoggingOut = true;
        await unauthorize();
        await closeEndpoint();
        await navigateTo('/', { replace: true });
    }
</script>

<!-- <Column spacing="30em" style="justify-content: center; align-items: center;"> -->
<Column spacing="30em">
    <MenuDrawer />

    <!-- Logout (TEMPORARY!) -->
    <Button.Root onclick={logout} disabled={isLoggingOut} style=":">
        {#if isLoggingOut}
            Logging out...
        {:else}
            Log out
        {/if}
    </Button.Root>
</Column>
