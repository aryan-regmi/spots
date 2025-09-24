<script lang="ts">
  import AuthProvider from '@/auth/AuthProvider.svelte';
  import { routes } from '@/pages/routes.svelte';
  import RouteLoader, {
    conditionsFailed,
    routeLoaded,
  } from '@/router/RouteLoader.svelte';
  import RouteProvider from '@/router/RouteProvider.svelte';
  import ThemeProvider from '@/theme/ThemeProvider.svelte';
  import Router from 'svelte-spa-router';
</script>

<main>
  <ThemeProvider>
    <AuthProvider>
      <RouteProvider>
        <RouteLoader>
          <Router
            {routes}
            on:conditionsFailed={conditionsFailed}
            on:routeLoaded={routeLoaded}
          />
        </RouteLoader>
      </RouteProvider>
    </AuthProvider>
  </ThemeProvider>
</main>

<style>
</style>
