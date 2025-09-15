<script lang="ts">
    import type { AuthContext } from '@/auth/types';
    import { getContext } from 'svelte';
    import LoginPage from '@/pages/login/LoginPage.svelte';

    const { isAuthenticated } = getContext<AuthContext>('authContext');
</script>

{#if isAuthenticated()}
    Dashboard
{:else}
    <LoginPage />
{/if}
