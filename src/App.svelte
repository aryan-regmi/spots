<script lang="ts">
  import AuthProvider from '@/auth/AuthProvider.svelte';
  import { routes } from '@/pages/routes.svelte';
  import Router from '@/router/Router.svelte';
  import RouterProvider from '@/router/RouterProvider.svelte';
</script>

<!-- FIXME: Change global styles to use CSS vars instead

Example: 

  -----------------
  LoginPage.svelte 
  -----------------

  <Alert --justify-content="center">
    Some alert message!
  </Alert>

  -----------------
  Card.svelte
  -----------------
  
  <style>
    .card {
      justify-content: var(--justify-content);
      ...
    }
  </style>
-->

<main>
  <AuthProvider>
    <RouterProvider>
      <Router {routes} />
    </RouterProvider>
  </AuthProvider>
</main>

<style>
</style>
