import useAuth from '@/auth/useAuth';
import { Avatar } from '@/components/Avatar';
import { A, useNavigate } from '@solidjs/router';
import { createSignal, onMount } from 'solid-js';

export function DashboardPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  /** Determines if the page is in a loading state. */
  const [loading, setLoading] = createSignal(false);

  onMount(() => {
    if (auth.authUser() === null) {
      navigate('/', { replace: true });
    }
  });

  return (
    <div>
      <Avatar
        name={auth.authUser()?.username || ''}
        onClick={() => console.log('Here')}
      />

      <h1>Welcome {auth.authUser()?.username}!</h1>
      <A
        href="/"
        replace
        onclick={() => {
          setLoading(true);
          try {
            auth.unauthenticate(auth.authUser()?.username!);
            navigate('/', { replace: true });
          } catch (error) {
            console.error(error);
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading() ? 'Logging out...' : 'Log out'}
      </A>
    </div>
  );
}
