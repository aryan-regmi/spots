<script lang="ts">
    import AuthProvider from '@/auth/AuthProvider.svelte';
    import LandingPage from '@/pages/LandingPage.svelte';
    import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
    import { setContext } from 'svelte';

    const queryClient = new QueryClient();
    setContext('queryClient', queryClient);
</script>

<main>
    <QueryClientProvider client={queryClient}>
        <AuthProvider {queryClient}>
            <LandingPage />
        </AuthProvider>
    </QueryClientProvider>
</main>

<style>
</style>
