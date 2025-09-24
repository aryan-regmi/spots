<script lang="ts">
  import { getContext } from 'svelte';
  import { navContextKey } from './navContextKey';
  import { type NavContext } from '@/router/types';

  let { currentComponent } = $state(getContext<NavContext>(navContextKey));

  let currentPage = $derived(currentComponent());
</script>

{#if currentPage}
  {@const CurrentPage = currentPage}
  <CurrentPage />
{/if}
