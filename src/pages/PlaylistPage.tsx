import { AuthenticationError } from '@/auth/authService';
import { useAuthService } from '@/auth/mockAuthServiceProvider';
import { useMusicLibraryService } from '@/backendApi/mockMusicLibraryServiceProvider';
import { Column } from '@/components/Column';
import { Loading } from '@/components/Loading';
import { LargePlaylistCard } from '@/components/Playlist';
import { Row } from '@/components/Row';
import { useNavigate, useParams } from '@solidjs/router';
import { Console, Duration, Effect, Schedule } from 'effect';
import {
  createEffect,
  createResource,
  createSignal,
  onMount,
  Show,
} from 'solid-js';

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

  const loadFollowState = () =>
    Effect.gen(function* () {
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
  onMount(() => Effect.runFork(loadFollowState()));

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

  return (
    <Column
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        'box-sizing': 'border-box',
        background:
          'linear-gradient(180deg, rgba(100, 120, 200, 1) 0%, rgba(40, 40, 40, 0.7) 55%)',
      }}
    >
      {/* Back and settings buttons */}
      <Row style={{ padding: '2rem' }}>
        <img
          style={{
            height: '2rem',
            width: '2rem',
            cursor: 'pointer',
          }}
          src="/public/icons8-back-50.png"
          onClick={() => navigate(-1)}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
      </Row>

      {/* Playlist header */}
      <Show when={playlist} fallback={<Loading />}>
        <Column style={{ gap: '0' }}>
          <LargePlaylistCard playlist={playlist} />
          <button
            style={{
              'align-self': 'center',
              'border-radius': '2em',
              'background-color': 'rgba(50, 200, 50, 0.8)',
            }}
            onClick={() => Effect.runFork(toggleFollowPlaylist)}
          >
            {isFollowing() ? 'Unfollow' : 'Follow'}
          </button>
        </Column>
      </Show>
    </Column>
  );
}
