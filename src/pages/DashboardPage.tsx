import {
  JSX,
  Match,
  Show,
  Switch,
  createResource,
  createSignal,
  onMount,
} from 'solid-js';
import { Avatar } from '@/components/Avatar';
import { BottomNavbar } from '@/components/BottomNavBar';
import { Column } from '@/components/Column';
import { Loading } from '@/components/Loading';
import { Navigator, useNavigate } from '@solidjs/router';
import { PlaylistGrid } from '@/components/Playlist';
import { Row } from '@/components/Row';
import {
  getUserRecord,
  useAuthProvider,
} from '@/authService/mockAuthServiceProvider';
import { useMusicLibraryProvider } from '@/musicLibraryService/mockMusicLibraryServiceProvider';
import { NIL as uuidNil } from 'uuid';
import { Playlist } from '@/musicLibraryService/musicLibraryService';
import {
  PLAYLISTS_STORE_NAME,
  useDBProvider,
} from '@/dbService/mockDBServiceProvider';
import { okAsync } from 'neverthrow';
import { AuthService } from '@/authService/authService';

/** The user's dashboard page. */
export function DashboardPage() {
  const navigate = useNavigate();
  const dbService = useDBProvider();
  const authService = useAuthProvider();
  const musicService = useMusicLibraryProvider();

  /** The `id` attribute for the popover menu. */
  const POPOVER_ID = 'popover-menu';

  if (!dbService.isReady || !authService.isReady || !musicService.isReady) {
    return <Loading />;
  }

  /** Redirects to home (login page) if there is no authenticated user. */
  function redirectToHome() {
    if (authService.isReady && authService.authUser === null) {
      navigate('/', { replace: true });
    }
  }

  /** Adds an `All Tracks` playlist if no playlist exists. */
  function createAllTracksPlaylist() {
    return dbService
      .getAllRecords<Playlist>(PLAYLISTS_STORE_NAME)
      .andThen((playlists) => {
        // If no playlists exist, or the `All Tracks` playlist doesn't exist, create a new one
        if (
          playlists.length == 0 ||
          !!!playlists.find((p) => p.id === uuidNil)
        ) {
          const allTracksPlaylist: Playlist = {
            id: uuidNil,
            name: 'All Tracks',
            createdBy: uuidNil,
            tracks: [],
            followers: [],
            pinned: [],
          };

          return okAsync(allTracksPlaylist);
        }

        return okAsync();
      })
      .andThen((allTracksPlaylist) => {
        return allTracksPlaylist
          ? dbService.putRecord<Playlist>(
              PLAYLISTS_STORE_NAME,
              allTracksPlaylist
            )
          : okAsync();
      })
      .orTee((e) => console.log('DBError', e.message, e.info))
      .mapErr(() => new Error(`Failed to create 'All Tracks' playlist`));
  }

  onMount(async () => {
    redirectToHome();

    let result = await createAllTracksPlaylist();
    result.match(
      (_ok) => console.debug('All Tracks playlist created'),
      (err) => console.debug(err)
    );
  });

  /** A resource pointing to the user's pinned playlists. */
  const [pinnedPlaylists] = createResource(async () => {
    const userId = await getUserRecord(authService.authUser!).map((u) => u?.id);
    if (userId.isOk() && userId.value !== undefined) {
      const result = await musicService.getPinnedPlaylists(userId.value);
      if (result.isOk()) {
        return result.value;
      }
      console.debug('ResourceError', result.error.message);
    }
  });

  /** A resource pointing to the user's recent playlists. */
  const [recentPlaylists] = createResource(async () => {
    const userId = await getUserRecord(authService.authUser!).map((u) => u?.id);
    if (userId.isOk() && userId.value !== undefined) {
      const result = await musicService.getRecentPlaylists(userId.value);
      if (result.isOk()) {
        return result.value;
      }
      console.debug('ResourceError', result.error.message);
    }
  });

  /** Determines if the `All Tracks` playlist is empty. */
  async function allTracksIsEmpty() {
    const res = await musicService
      .getPlaylist(uuidNil)
      .map((p) => (p ? (p.tracks.length === 0 ? true : false) : true));
    if (res.isOk()) {
      return res.value;
    }
    console.debug('MusicLibraryError', res.error.message);
    return true;
  }

  /** Style for the entire page/container div. */
  const dashboardContainerStyle: JSX.CSSProperties = {
    padding: '0 2em 0 2em',
    margin: 0,
    gap: 0,
  };

  return (
    <>
      <PopoverMenu
        popoverId={POPOVER_ID}
        navigate={navigate}
        username={authService.authUser}
        unauthenticate={authService.unauthenticate}
      ></PopoverMenu>

      <Show when={authService.isReady && authService.authUser !== null}>
        <Column style={dashboardContainerStyle}>
          <Avatar
            name={authService.authUser!}
            popoverTargetId={POPOVER_ID}
            animate
          />
          <br />

          <Switch>
            {/* Initial dashboard view */}
            <Match when={allTracksIsEmpty}>
              <Column style={{ 'margin-top': '10rem' }}>
                <ImportTracksButton />
              </Column>
            </Match>

            {/* Populated dashboard view */}
            <Match when={pinnedPlaylists() && pinnedPlaylists()!.length > 0}>
              <PlaylistGrid playlists={pinnedPlaylists()!} />
            </Match>
          </Switch>
          <br />

          <Show when={recentPlaylists() && recentPlaylists()!.length > 0}>
            <h2 style={{ 'align-self': 'start' }}>Recently Played</h2>
            {/* TODO: Add carousel for recent playlists! */}
          </Show>
        </Column>

        {/* TODO: Add player */}

        <BottomNavbar currentPath="/dashboard" />
      </Show>
    </>
  );
}

/** A button that initiates a filer picker. */
function ImportTracksButton() {
  let fileInputRef!: HTMLInputElement;
  const trackImporter = TrackImporter();

  /** Style for the button. */
  const buttonStyle: JSX.CSSProperties = {
    'background-color': 'rgba(50, 150, 50, 1)',
    'vertical-align': 'middle',
    'align-self': 'center',
  };

  return (
    <div>
      <button style={buttonStyle} onClick={() => fileInputRef.click()}>
        Import Tracks
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={trackImporter.addTracksToMusicLibrary}
      />
    </div>
  );
}

/** The popover menu. */
function PopoverMenu(props: {
  popoverId: string;
  navigate: Navigator;
  username: string;
  unauthenticate: AuthService['unauthenticate'];
}) {
  /** The background color of the menu header.  */
  const [headerBgColor, setHeaderBgColor] = createSignal('rgba(0, 0, 0, 0)');

  /** Determines if the page is in a loading state. */
  const [loading, setLoading] = createSignal(false);

  /** Logs the user out and redirects to the login page. */
  async function logout() {
    setLoading(true);
    const res = await props.unauthenticate();
    if (res.isErr()) {
      console.debug(res.error.name, res.error.message);
    }
    setLoading(false);
  }

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
                <Avatar name={props.username}></Avatar>
                <span
                  style={{
                    color: 'white',
                    padding: 0,
                    'margin-left': '-1.5rem',
                    'margin-top': '0.7rem',
                  }}
                >
                  {props.username}
                </span>
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
              onClick={logout}
            >
              {loading() ? 'Logging out...' : 'Log out'}
            </button>
          </span>
        </Column>
      </div>
    </>
  );
}
