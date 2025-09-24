<script lang="ts">
  import { navContextKey } from './navContextKey';
  import { pop, push, replace, type RouterEvent } from 'svelte-spa-router';
  import { setContext } from 'svelte';
  import { type NavContext } from './types';

  let { children } = $props();

  setContext<NavContext>(navContextKey, {
    navigateTo: function (path: string, options?: { replace?: boolean }) {
      if (path != window.location.pathname) {
        if (options?.replace) {
          replace(path);
        } else {
          push(path);
        }
      }
    },
    navigateBack: function () {
      pop();
    },
  });
</script>

{@render children()}
