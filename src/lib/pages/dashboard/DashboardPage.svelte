<script lang="ts">
  import { closeEndpoint } from '@/api/network';
  import type { AuthContext } from '@/auth/types';
  import type { NavContext } from '@/router/types';
  import { getContext } from 'svelte';

  const { unauthorize } = getContext<AuthContext>('authContext');
  const { navigateTo } = getContext<NavContext>('navContext');
</script>

<div>
  Dashboard!

  <button
    onclick={async () => {
      await unauthorize();
      await closeEndpoint();
      navigateTo('/', { replace: true });
    }}>Log out</button
  >
</div>
