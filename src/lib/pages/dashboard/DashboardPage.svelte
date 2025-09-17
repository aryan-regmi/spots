<script lang="ts">
  import { closeEndpoint } from '@/api/network';
  import type { AuthContext } from '@/auth/types';
  import type { NavContext } from '@/router/types';
  import { getContext } from 'svelte';

  const { unauthorize } = getContext<AuthContext>('authContext');
  const { navigateTo } = getContext<NavContext>('navContext');

  let isLoggingOut = $state(false);
</script>

<div>
  Dashboard!

  <button
    onclick={async () => {
      isLoggingOut = true;
      await unauthorize();
      await closeEndpoint();
      navigateTo('/', { replace: true });
    }}
  >
    {#if isLoggingOut}
      Logging out...
    {:else}
      Log out
    {/if}
  </button>
</div>
