<script lang="ts">
    import type { AuthContext } from '@/auth/types';
    import { getContext, onMount } from 'svelte';
    import LoginPage from '@/pages/login/LoginPage.svelte';
    import DashboardPage from './dashboard/DashboardPage.svelte';
    import type { Pages } from './types';
    import SignupPage from './signup/SignupPage.svelte';

    type Props = {
        currentPage: Pages;
    };
    let { currentPage }: Props = $props();

    // Function to check if session is authenticated or not.
    const { isAuthenticated } = getContext<AuthContext>('authContext');

    onMount(async () => {
        // Route to landing page based on authentication state
        if (!currentPage) {
            console.log(isAuthenticated());
            if (isAuthenticated()) {
                currentPage = 'DashboardPage';
            } else {
                currentPage = 'LoginPage';
            }
        }
    });
</script>

{#if currentPage === 'LoginPage'}
    <LoginPage />
{:else if currentPage === 'DashboardPage'}
    <DashboardPage />
{:else if currentPage === 'SignupPage'}
    <SignupPage />
{:else}
    <div>Loading...</div>
{/if}
