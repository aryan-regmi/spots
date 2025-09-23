<script lang="ts">
  import CaretLeft from 'phosphor-svelte/lib/CaretLeft';
  import Column from '@/components/Column.svelte';
  import IconButton from '@/components/IconButton.svelte';
  import QR from '@svelte-put/qr/img/QR.svelte';
  import type { AuthContext } from '@/auth/types';
  import { getContext } from 'svelte';
  import { getEndpointAddress } from '@/api/network';
  import { navContextKey, type NavContext } from '@/router/types';

  const { isAuthenticated, authUser } = getContext<AuthContext>('authContext');
  const { navigateBack } = getContext<NavContext>(navContextKey);

  let endpointAddress = $state<string>();
  $effect(() => {
    if (isAuthenticated()) {
      let user = authUser();
      if (user) {
        getEndpointAddress(user.id).then((addr) => (endpointAddress = addr));
      }
    }
  });
</script>

<div>
  <Column spacing="1em">
    <IconButton onclick={navigateBack}>
      <CaretLeft
        font-size="2em"
        style="padding-bottom: -2em; transform: translateX(-4em);"
      />
    </IconButton>
    <div style="padding: 0.5em; background-color: white; border-radius: 1em;">
      <QR
        data={endpointAddress ?? ''}
        moduleFill="white"
        anchorOuterFill="white"
        anchorInnerFill="white"
        width="250em"
        height="250em"
      />
    </div>
    <div style="height: 30em;"></div>
  </Column>
</div>
