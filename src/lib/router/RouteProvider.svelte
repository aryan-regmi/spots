<script lang="ts">
  import page from 'page';
  import { navContextKey, type NavContext } from './types';
  import { routes, type RouteInfo } from '@/pages/routes.svelte';
  import { setContext, type Component } from 'svelte';

  let { children } = $props();

  /** The current page being displayed. */
  let currentPage = $state<RouteInfo>();

  // Set up initial routes.
  $effect.pre(() => {
    routes.map((route) => {
      page(route.path, (ctx, next) => {
        route.loader?.(ctx, next);
        currentPage = route;
      });
    });

    page();

    setContext<NavContext>(navContextKey, {
      currentComponent: function () {
        return currentPage?.component;
      },
      setCurrentComponent: function (component: Component) {
        if (currentPage) {
          currentPage.component = component;
        }
      },
      navigateTo: function (path: string, options?: { replace?: boolean }) {
        if (path != window.location.pathname) {
          let destPage = routes.find((route) => route.path === path);
          if (currentPage && destPage) {
            currentPage.component = destPage.component;
          }

          if (options?.replace) {
            page.replace(path, { dest: window.location.pathname });
          }
          page.show(path);
        }
      },
      navigateBack: function () {
        window.history.go(-1);
        return;
      },
    });
  });
</script>

{@render children()}
