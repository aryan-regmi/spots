<script lang="ts">
    import type { AuthContext } from '@/auth/types';
    import { getContext } from 'svelte';

    const { isAuthenticated } = getContext<AuthContext>('authContext');
</script>

{#if isAuthenticated()}
    Dashboard
{:else}
    Login
{/if}
