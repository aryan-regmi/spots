<script lang="ts">
  import AuthProvider from '@/auth/AuthProvider.svelte';
  import RouteProvider from '@/router/RouteProvider.svelte';
  import Router from '@/router/Router.svelte';
</script>

<!-- FIXME: Add theme context ASAP so i dont have to update everything later! -->

<main>
  <AuthProvider>
    <RouteProvider>
      <Router />
    </RouteProvider>
  </AuthProvider>
</main>

<style>
</style>
