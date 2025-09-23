<script lang="ts">
  import AuthProvider from '@/auth/AuthProvider.svelte';
  import { routes } from '@/pages/routes.svelte';
  import Router from '@/router/Router.svelte';
  import RouterProvider from '@/router/RouterProvider.svelte';
</script>

<main>
  <AuthProvider>
    <RouterProvider>
      <Router {routes} />
    </RouterProvider>
  </AuthProvider>
</main>

<style>
</style>
