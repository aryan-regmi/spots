import { Effect } from 'effect';
import {
  createResource,
  createSignal,
  JSX,
  onMount,
  Resource,
  Show,
} from 'solid-js';
import { useAuthService } from '@/auth/mockAuthServiceProvider';
import { Navigator, useNavigate } from '@solidjs/router';
import { Avatar } from '@/components/Avatar';
import { Column } from '@/components/Column';
import { Row } from '@/components/Row';
import { Loading } from '@/components/Loading';
import { PinnedPlaylists } from '@/components/Playlist';
import { BottomNavbar } from '@/components/BottomNavBar';
import { usePlaylistService } from '@/backendApi/mockPlaylistServiceProvider';

/** The user's dashboard page. */
export function DashboardPage() {
  const navigate = useNavigate();
  const auth = useAuthService();
  const playlistService = usePlaylistService();

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

  /** The 6 pinned playlists. */
  const [pinnedPlaylists] = createResource(
    username,
    async (username) => {
      const playlists = await Effect.runPromise(
        playlistService.getPinnedPlaylists(username)
      ).catch(console.error);

      return playlists ? playlists.slice(0, 6) : [];
    },
    { initialValue: [] }
  );

  /** Style for the entire page/container div. */
  const dashboardContainerStyle: JSX.CSSProperties = {
    padding: '0 2em 0 2em',
    margin: 0,
    gap: 0,
  };

  /** The `id` attribute for the popover menu. */
  const POPOVER_ID = 'popover-menu';

  return (
    <>
      <PopoverMenu
        popoverId={POPOVER_ID}
        navigate={navigate}
        username={username}
        unauthenticate={auth.unauthenticate}
      ></PopoverMenu>

      <Column style={dashboardContainerStyle}>
        <Show when={username()} fallback={<Loading />}>
          <Avatar name={username()!} popoverTargetId={POPOVER_ID} animate />
          <br />

          <span style={{}}>
            <PinnedPlaylists playlists={pinnedPlaylists()} />
          </span>
          <br />

          <h2 style={{ 'align-self': 'start' }}>Recently Played</h2>
        </Show>
      </Column>

      <BottomNavbar currentPath="/dashboard" />
    </>
  );
}

function PopoverMenu(props: {
  popoverId: string;
  navigate: Navigator;
  username: Resource<string | null>;
  unauthenticate: Effect.Effect<void, never, never>;
}) {
  /** The background color of the menu header.  */
  const [headerBgColor, setHeaderBgColor] = createSignal('rgba(0, 0, 0, 0)');

  /** Determines if the page is in a loading state. */
  const [loading, setLoading] = createSignal(false);

  /** Logs the user out and redirects to the login page. */
  const logout = Effect.gen(function* () {
    setLoading(true);
    yield* props.unauthenticate;
    props.navigate('/', { replace: true });
    setLoading(false);
  });

  /** Style for the popover menu. */
  const style: JSX.CSSProperties = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '50vw',
    height: '100vh',
    padding: 0,
    'margin-left': '-1px',
    'margin-top': '-1px',
    'background-color': 'rgba(0, 0, 0, 0.5)',
    'box-sizing': 'border-box',
    'z-index': 1000,
    'border-radius': '0 1rem 1rem 0',
    'pointer-events': 'auto',
    'backdrop-filter': 'blur(20px)',
  };

  /** Style for the disabled button. */
  const disableBtnStyle = {
    outline: 'none',
    'border-color': 'gray',
    'background-color': 'gray',
    cursor: 'not-allowed',
  };

  /** Colors for the menu header. */
  const menuHeaderColors = {
    normal: 'rgba(0, 0, 0, 0)',
    hover: 'rgba(10, 10, 10, 0.2)',
  };

  /** Style for the menu header. */
  const menuHeaderStyle: () => JSX.CSSProperties = () => ({
    'background-color': headerBgColor(),
    'border-radius': '1rem',
    padding: '2rem',
    'padding-bottom': 0,
    'margin-top': '-2rem',
    'margin-left': '-2rem',
    'margin-right': '-1.5rem',
  });

  /** Style for the `View Profile` text in the menu header. */
  const viewProfileStyle: () => JSX.CSSProperties = () => ({
    'font-size': '0.8em',
    color:
      headerBgColor() === menuHeaderColors.normal
        ? 'gray'
        : 'rgba(255, 255, 255, 0.6)',
    margin: 0,
    'align-self': 'flex-start',
    'padding-left': '4.25em',
    'margin-top': '-1em',
  });

  /** Style for the submit button. */
  const btnStyle: JSX.CSSProperties = {
    'margin-top': '1.75rem',
    'border-radius': '2rem',
    'align-self': 'center',
    width: '10rem',
  };

  /** Style for overed buttons. */
  const btnHoverStyle = `
    button {
      background-color: rgba(10, 10, 10, 1);
    }
    button:hover {
      background-color: rgba(15, 20, 15, 0.7);
      border-color: rgba(25, 25, 25, 1);
    }
    `;

  return (
    <>
      <style>{btnHoverStyle}</style>

      {/* Popover menu */}
      <div
        id={props.popoverId}
        style={{
          ...style,
          'background-color': 'transparent',
        }}
        popover
      >
        <Column style={{ padding: '5rem 2rem 2rem 2.4rem' }}>
          {/* Menu header */}
          <span
            id="menu-header"
            style={menuHeaderStyle()}
            onMouseEnter={() => setHeaderBgColor(menuHeaderColors.hover)}
            onMouseLeave={() => setHeaderBgColor(menuHeaderColors.normal)}
            onClick={() => props.navigate('/dashboard/view-profile')}
          >
            <Column
              style={{
                gap: 0,
                cursor: 'pointer',
              }}
            >
              <Row>
                <Show when={props.username()} fallback={<Loading />}>
                  <Avatar name={props.username()!}></Avatar>
                  <span
                    style={{
                      color: 'white',
                      padding: 0,
                      'margin-left': '-1.5rem',
                      'margin-top': '0.7rem',
                    }}
                  >
                    {props.username()}
                  </span>
                </Show>
              </Row>
              <span style={viewProfileStyle()}>View Profile</span>
            </Column>
          </span>

          <hr
            style={{
              width: '100%',
              'margin-top': '-2em',
              color: 'rgba(30,35,45,0.8)',
            }}
          />

          {/* Menu content */}
          <span>
            {/* Logout button */}
            <button
              disabled={loading()}
              style={loading() ? disableBtnStyle : btnStyle}
              onClick={() => Effect.runFork(logout)}
            >
              {loading() ? 'Logging out...' : 'Log out'}
            </button>
          </span>
        </Column>
      </div>
    </>
  );
}
