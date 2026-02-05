import { AuthenticationError } from '@/auth/authService';
import { Column } from '@/components/Column';
import { Effect } from 'effect';
import { LargePlaylistCard, TrackCard } from '@/components/Playlist';
import { Loading } from '@/components/Loading';
import { Row } from '@/components/Row';
import { createSignal, For, onMount, Show } from 'solid-js';
import { useAuthService } from '@/auth/mockAuthServiceProvider';
import { useMusicLibraryService } from '@/backendApi/mockMusicLibraryServiceProvider';
import { useNavigate, useParams } from '@solidjs/router';
import { JSX } from 'solid-js/h/jsx-runtime';

export function PlaylistPage() {
  const params = useParams();
  const navigate = useNavigate();
  const musicLibService = useMusicLibraryService();
  const authService = useAuthService();

  /** Id of the playlist */
  const playlistId = params.id;
  if (playlistId === undefined) {
    console.error('Invalid playlist: undefined ID');
    return;
  }

  /** The current playlist. */
  const playlist = Effect.runSync(musicLibService.getPlaylist(playlistId));

  /** Determines if the logged in user follows this playlist. */
  const [isFollowing, setIsFollowing] = createSignal(false);

  /** Determines whether or not the playlist is followed by the current user. */
  const loadFollowState = Effect.gen(function* () {
    const authUser = yield* authService.data;
    const currentPlaylist = playlist;
    if (
      !isFollowing() &&
      authUser.username &&
      currentPlaylist &&
      currentPlaylist.followers.includes(authUser.username)
    ) {
      setIsFollowing(true);
    } else {
      setIsFollowing(false);
    }
  });
  onMount(() => Effect.runFork(loadFollowState));

  /** Toggles the `Follow` button for the playlist. */
  const toggleFollowPlaylist = Effect.gen(function* () {
    const authUser = yield* authService.data;
    if (authUser.username) {
      const following = yield* musicLibService.toggleFollowPlaylist(
        authUser.username,
        playlistId
      );
      setIsFollowing(following);
    } else {
      return yield* Effect.fail(
        new AuthenticationError({ message: 'No authenticated user found' })
      );
    }
  });

  /** Style for the main container Column. */
  const containerStyle: JSX.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    'box-sizing': 'border-box',
    background:
      'linear-gradient(180deg, rgba(100, 120, 200, 1) 0%, rgba(40, 40, 40, 0.7) 55%)',
  };

  /** Style for the navigation buttons at top of page. */
  const navButtonsStyle: JSX.CSSProperties = {
    height: '2rem',
    width: '2rem',
    cursor: 'pointer',
  };

  /** Style for the `Follow` button. */
  const followBtnStyle: JSX.CSSProperties = {
    'border-radius': '2em',
    'background-color': 'rgba(50, 200, 50, 0.8)',
  };

  return (
    <Column style={containerStyle}>
      {/* Back and settings buttons */}
      <Row style={{ padding: '2rem' }}>
        <img
          style={navButtonsStyle}
          src="/public/icons8-back-50.png"
          onClick={() => navigate(-1)}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
      </Row>

      <Show when={playlist} fallback={<Loading />}>
        {/* Playlist header */}
        <Column style={{ gap: '0' }}>
          <LargePlaylistCard playlist={playlist} />
          <Row style={{ 'align-self': 'center' }}>
            {/* Follow button */}
            <button
              style={followBtnStyle}
              onClick={() => Effect.runFork(toggleFollowPlaylist)}
            >
              {isFollowing() ? 'Unfollow' : 'Follow'}
            </button>

            {/* Add tracks button */}
            {/* TODO: Add functionality! */}
            <button style={followBtnStyle}>+ Add Tracks</button>
          </Row>
        </Column>

        {/* Playlist tracks */}
        <Column>
          {console.log(playlist)}
          <For each={playlist.tracks}>
            {(trackId) => {
              console.log(playlist);
              console.log(trackId);
              const track = Effect.runSync(musicLibService.getTrack(trackId));
              console.log(track);

              return (
                <TrackCard
                  track={Effect.runSync(musicLibService.getTrack(trackId))}
                />
              );
            }}
          </For>
        </Column>
      </Show>
    </Column>
  );
}
