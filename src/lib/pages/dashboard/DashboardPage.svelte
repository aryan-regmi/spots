<script lang="ts">
    import { closeEndpoint } from '@/api/network';
    import type { AuthContext } from '@/auth/types';
    import Column from '@/components/Column.svelte';
    import type { NavContext } from '@/router/types';
    import { Button } from 'bits-ui';
    import { getContext } from 'svelte';

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

<Column>
    <Button.Root onclick={logout}>
        {#if isLoggingOut}
            Logging out...
        {:else}
            Log out
        {/if}
    </Button.Root>
</Column>
