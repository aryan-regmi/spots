<script lang="ts">
    import AuthProvider from '@/auth/AuthProvider.svelte';
    import { routes } from '@/pages/routes.svelte';
    import Router from '@/router/Router.svelte';
    import RouterProvider from '@/router/RouterProvider.svelte';
    import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
    import { setContext } from 'svelte';

    const queryClient = new QueryClient();
    setContext('queryClient', queryClient);
</script>

<main>
    <QueryClientProvider client={queryClient}>
        <AuthProvider {queryClient}>
            <RouterProvider>
                <Router {routes} />
            </RouterProvider>
        </AuthProvider>
    </QueryClientProvider>
</main>

<style>
</style>
