import { useAuth } from '@/services/auth/provider';
import { createAsync } from '@solidjs/router';
import { Shimmer } from '@shimmer-from-structure/solid';

export function NavMusicLayout(props: { children?: any }) {
  const auth = useAuth();
  const getAuthUserQuery = createAsync(() => auth.getAuthUserQuery());

  return (
    <>
      <Shimmer loading={getAuthUserQuery() === undefined}>
        <div>Hello</div>
        {props.children}
        <div>Goodbye</div>
      </Shimmer>
    </>
  );
}
