<script lang="ts">
  import { getContext } from 'svelte';
  import type { NavContext } from './types';

  let { currentComponent } = $state(getContext<NavContext>('navContext'));

  let currentPage = $derived(currentComponent());
</script>

{#if currentPage}
  {@const CurrentPage = currentPage}
  <CurrentPage />
{/if}
