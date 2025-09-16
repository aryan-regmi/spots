<script lang="ts">
    import AuthProvider from '@/auth/AuthProvider.svelte';
    import LandingPage from '@/pages/LandingPage.svelte';
    import type { NavContext, Pages } from '@/pages/types';
    import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
    import { setContext } from 'svelte';

    const queryClient = new QueryClient();
    setContext('queryClient', queryClient);
    setContext<NavContext>('navContext', { navigateTo });

    /** The current page being displayed. */
    let currentPage = $state<Pages>();

    /** Navigates to the specified page. */
    async function navigateTo(page: Pages) {
        currentPage = page;
    }
</script>

<main>
    <QueryClientProvider client={queryClient}>
        <AuthProvider {queryClient}>
            <LandingPage {currentPage} />
        </AuthProvider>
    </QueryClientProvider>
</main>

<style>
</style>
