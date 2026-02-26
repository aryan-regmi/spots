import { Logger } from '@/utils/logger';
import { Shimmer } from '@shimmer-from-structure/solid';
import { onMount } from 'solid-js';
import { getAuthTokenResource, useStore } from '@/utils/tauriStore';
import { useNavigate } from '@solidjs/router';
import { Navbar } from '@/components/Navbar';
import { MiniPlayer } from '@/components/MiniPlayer';

/** Defines the layout with a navbar and minit music player. */
export function NavMusicLayout(props: { children?: any }) {
  const navigate = useNavigate();
  const storeCtx = useStore();
  const [authToken] = getAuthTokenResource(storeCtx);

  /** Redirects to login if not authenticated */
  onMount(async () => {
    if (authToken.loading) {
      return;
    }

    if (authToken() === undefined) {
      Logger.info('Authenticated user not found: redirecting to login');
      navigate('/', { replace: true });
      return;
    }
  });

  return (
    <div class="col">
      <Shimmer loading={authToken.loading}>
        {props.children}
        <MiniPlayer />
        <Navbar currentPath="/user/dashboard" />
      </Shimmer>
    </div>
  );
}
