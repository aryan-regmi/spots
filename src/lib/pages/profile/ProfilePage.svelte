<script lang="ts">
  import { Button } from 'bits-ui';
  import { getContext } from 'svelte';
  import type { NavContext } from '@/router/types';

  const { navigateTo } = getContext<NavContext>('navContext');
</script>

<div>
  <Button.Root onclick={() => navigateTo('/dashboard')}>Back</Button.Root>
</div>
