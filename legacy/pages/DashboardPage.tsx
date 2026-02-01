import { AuthContextType } from '@/auth/AuthContext';
import useAuth from '@/auth/useAuth';
import { Avatar } from '@/components/Avatar';
import { Column } from '@/components/Column';
import { PinnedPlaylists } from '@/components/Playlist';
import { Row } from '@/components/Row';
import { mockPlaylists } from '@/mockApi/playlists';
import { Navigator, useNavigate } from '@solidjs/router';
import { Effect } from 'effect';
import {
  Accessor,
  JSX,
  Setter,
  createEffect,
  createSignal,
  onMount,
} from 'solid-js';

/** The user's dashboard page. */
export function DashboardPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  if (!auth) {
    return;
  }

  /** Determines if the page is in a loading state. */
  const [loading, setLoading] = createSignal(false);

  /** Username for the currently logged in user. */
  const [username, setUsername] = createSignal('unknown');

  /** Redirects to login page if no user is logged in. */
  onMount(() => {
    if (auth.authUser() === null && auth.isLoading() === false) {
      navigate('/', { replace: true });
    }
  });

  /** Sets the username once user has been authenticated. */
  createEffect(() => {
    if (auth.authUser()) {
      setUsername(auth.authUser()?.username!);
    }
  });

  /** Style for the entire page/container div. */
  const dashboardContainerStyle: JSX.CSSProperties = {
    display: 'flex',
    'flex-direction': 'column',
    padding: '0em 2em 2em',
    'margin-top': '-3em',
  };

  /** The `id` attribute for the popover menu. */
  const popoverId = 'popover-menu';

  return (
    <>
      <PopoverMenu
        popoverId={popoverId}
        auth={auth}
        navigate={navigate}
        loading={loading}
        setLoading={setLoading}
        username={username}
      />

      <div style={dashboardContainerStyle}>
        <Avatar name={username()} popoverTargetId={popoverId} animate />
        <br />
        <PinnedPlaylists playlists={mockPlaylists} />
        <br />

        <h2 style={{ 'align-self': 'start' }}>Recently Played</h2>
      </div>
    </>
  );
}

function PopoverMenu(props: {
  popoverId: string;
  auth: AuthContextType;
  navigate: Navigator;
  loading: Accessor<boolean>;
  setLoading: Setter<boolean>;
  username: Accessor<string>;
}) {
  /** The background color of the menu header.  */
  const [headerBgColor, setHeaderBgColor] = createSignal('rgba(0, 0, 0, 0.0)');

  /** Logs the user out and redirects to the login page. */
  const logout = Effect.gen(function* () {
    props.setLoading(true);
    yield* props.auth.unauthenticate;
    props.navigate('/', { replace: true });
    props.setLoading(false);
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
    'border-radius': '0 1em 1em 0',
    'backdrop-filter': 'blur(50px)',
    'border-width': '0.01em',
    'border-color': 'rgba(30, 30, 30, 0.8)',
  };

  /** Style for the disabled button. */
  const DisableBtnStyle = {
    outline: 'none',
    'border-color': 'gray',
    'background-color': 'gray',
    cursor: 'not-allowed',
  };

  return (
    <div id={props.popoverId} style={style} popover>
      <Column style={{ padding: '4em 2em 2em 2.4em' }}>
        {/* Menu header */}
        <span
          id="menu-header"
          onMouseEnter={() => {
            setHeaderBgColor('rgba(0, 0, 0, 0.1)');
          }}
          onMouseLeave={() => {
            setHeaderBgColor('rgba(0, 0, 0, 0)');
          }}
          onClick={() => {}}
          style={{
            'background-color': headerBgColor(),
            'border-radius': '1em',
            padding: '2em',
            'padding-bottom': 0,
            'margin-top': '-2em',
            'margin-left': '-2em',
            'margin-right': '-1.5em',
          }}
        >
          <Column
            style={{
              gap: '0',
              cursor: 'pointer',
            }}
          >
            <Row style={{ gap: '0.5em', 'align-items': 'center' }}>
              <Avatar name={props.username()} />
              <span style={{ color: 'white' }}>
                {props.auth.authUser()?.username}
              </span>
            </Row>

            <span
              style={{
                'font-size': '0.8em',
                color: 'gray',
                margin: 0,
                'align-self': 'flex-start',
                'padding-left': '4.25em',
                'margin-top': '-1em',
              }}
            >
              View Profile
            </span>
          </Column>
        </span>
        <hr
          style={{
            width: '100%',
            'margin-top': '-2em',
            color: 'rgba(30,35,45,0.8)',
          }}
        />

        {/* Menu content/list */}
        <span>
          <button
            disabled={props.loading()}
            style={props.loading() ? DisableBtnStyle : {}}
            onClick={() => Effect.runFork(logout)}
          >
            {props.loading() ? 'Logging out...' : 'Log out'}
          </button>
        </span>
      </Column>
    </div>
  );
}
