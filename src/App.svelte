<script lang="ts">
  import AuthProvider from '@/auth/AuthProvider.svelte';
  import RouteProvider from '@/router/RouteProvider.svelte';
  import Router from '@/router/Router.svelte';
</script>

<main>
  <AuthProvider>
    <RouteProvider>
      <Router />
    </RouteProvider>
  </AuthProvider>
</main>

<style>
</style>
