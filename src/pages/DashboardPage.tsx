import { Console, Effect } from 'effect';
import { createResource, JSX, onMount, Suspense } from 'solid-js';
import { useAuth } from '@/auth/mockAuthServiceProvider';
import { useNavigate } from '@solidjs/router';
import { Avatar } from '@/components/Avatar';

/** The user's dashboard page. */
export function DashboardPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  /** Redirects to home (login page) if there is no authenticated user. */
  const redirectToHome = Effect.gen(function* () {
    const authInfo = yield* auth.data;
    const authLoading = yield* auth.isLoading;
    if (authInfo.username === null && authLoading === false) {
      navigate('/', { replace: true });
    }
  });

  /** Run `redirectToDashboard` when component is mounted. */
  onMount(() => Effect.runFork(redirectToHome));

  /** The currently authenticated user's username. */
  const [username] = createResource(async () => {
    return await Effect.gen(function* () {
      return (yield* auth.data).username;
    }).pipe(Effect.runPromise);
  });

  /** Style for the entire page/container div. */
  const dashboardContainerStyle: JSX.CSSProperties = {
    display: 'flex',
    'flex-direction': 'column',
    padding: '0em 2em 2em',
    'margin-top': '-3em',
  };

  /** The `id` attribute for the popover menu. */
  const POPOVER_ID = 'popover-menu';

  return (
    <>
      <div style={dashboardContainerStyle}>
        {/* TODO: Add acutal fallback */}
        <Suspense fallback={<div>Loading...</div>}>
          <Avatar name={username() || 'Unknown'} />
        </Suspense>
      </div>
    </>
  );
}
