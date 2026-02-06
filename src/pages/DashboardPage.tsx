import {
  JSX,
  Match,
  Resource,
  Show,
  Switch,
  createEffect,
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
import { useAuthProvider } from '@/authService/mockAuthServiceProvider';
import { useMusicLibraryProvider } from '@/musicLibraryService/mockMusicLibraryServiceProvider';
import { NIL as uuidNil, v1 as uuidV1 } from 'uuid';
import { Playlist } from '@/musicLibraryService/musicLibraryService';
import {
  USERS_STORE_NAME,
  useDBProvider,
} from '@/dbService/mockDBServiceProvider';

/** The user's dashboard page. */
export function DashboardPage() {
  const navigate = useNavigate();
  const dbService = useDBProvider();
  const authService = useAuthProvider();
  const musicService = useMusicLibraryProvider();

  if (!authService.isReady || !musicService.isReady) {
    return <Loading />;
  }

  /** The `id` attribute for the popover menu. */
  const POPOVER_ID = 'popover-menu';

  /** Redirects to home (login page) if there is no authenticated user. */
  function redirectToHome() {
    if (authService.isReady && authService.authUser === null) {
      navigate('/', { replace: true });
    }
  }

  /** Adds an `All Tracks` playlist if no playlist exists. */
  function createAllTracksPlaylist() {
    const playlist: Playlist = {
      id: uuidNil,
      name: 'All Tracks',
      createdBy: uuidNil,
      tracks: [],
      followers: [],
    };
  }
  const createAllTracksPlaylist = Effect.gen(function* () {
    const allTracksExists = yield* musicService
      .getPlaylist(ALL_TRACKS.id)
      .pipe(Effect.either, Effect.map(Either.isRight));

    if (!allTracksExists) {
      yield* musicService.createPlaylist({
        name: ALL_TRACKS.name,
        createdBy: ALL_TRACKS.createdBy,
      });
    }
  });

  /** Determines if the `All Tracks` playlist is empty. */
  let allTracksIsEmpty = false;
  createEffect(() =>
    Effect.runPromise(musicService.getPlaylist(ALL_TRACKS.id)).then(
      (playlist) => (allTracksIsEmpty = playlist.tracks.length === 0)
    )
  );

  /** The currently authenticated user's username. */
  const [username] = createResource(async () => {
    return await Effect.gen(function* () {
      return (yield* authService.data).username;
    }).pipe(Effect.runPromise);
  });

  /** The 6 pinned playlists. */
  const [pinnedPlaylists] = createResource(
    username,
    async (username) => {
      const playlists = await Effect.runPromise(
        musicService.getPinnedPlaylists(username)
      ).catch(console.error);

      return playlists ? playlists.slice(0, 6) : [];
    },
    { initialValue: [] }
  );

  /** The 12 most recently listented to playlists. */
  const [recentPlaylists] = createResource(
    username,
    async (username) => {
      const playlists = await Effect.runPromise(
        musicService.getRecentPlaylists(username)
      ).catch(console.error);
      return playlists ? playlists.slice(0, 12) : [];
    },
    { initialValue: [] }
  );

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
        username={username}
        unauthenticate={authService.unauthenticate}
      ></PopoverMenu>

      <Column style={dashboardContainerStyle}>
        <Show when={username()} fallback={<Loading />}>
          <Avatar name={username()!} popoverTargetId={POPOVER_ID} animate />
          <br />

          <Switch>
            {/* Initial dashboard view */}
            <Match when={allTracksIsEmpty}>
              <Column style={{ 'margin-top': '10rem' }}>
                {/* TODO: Add file picker! */}
                <ImportTracksButton />
              </Column>
            </Match>

            {/* Populated dashboard view */}
            <Match when={pinnedPlaylists().length > 0}>
              <PlaylistGrid playlists={pinnedPlaylists()} />
            </Match>
          </Switch>
          <br />

          <Show when={recentPlaylists().length > 0}>
            <h2 style={{ 'align-self': 'start' }}>Recently Played</h2>
            {/* TODO: Add carousel for recent playlists! */}
          </Show>
        </Show>
      </Column>

      {/* TODO: Add player */}

      <BottomNavbar currentPath="/dashboard" />
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
