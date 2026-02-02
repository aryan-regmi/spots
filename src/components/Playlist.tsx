import { Column } from '@/components/Column';
import { Playlist } from '@/backendApi/musicLibraryService';
import { Row } from '@/components/Row';
import { createSignal, JSX } from 'solid-js';
import { useNavigate } from '@solidjs/router';

/** Displays a grid of playlists. */
export function PlaylistGrid(props: { playlists: Playlist[] }) {
  const containerStyle: JSX.CSSProperties = {
    display: 'grid',
    'grid-template-columns': 'repeat(2, 1fr)',
    'grid-template-rows': 'auto',
    gap: '1.5em',
  };

  return (
    <>
      <div style={containerStyle}>
        {props.playlists.map((playlist) => {
          return <PlaylistCard playlist={playlist} />;
        })}
      </div>
    </>
  );
}

/** A card for a playlist. */
export function PlaylistCard(props: { playlist: Playlist }) {
  const playlist = props.playlist;
  const navigate = useNavigate();

  /** Background color of the card. */
  const [bgColor, setBgColor] = createSignal('rgba(20, 20, 20, 1)');

  /** Opacity of the image. */
  const [imgAlpha, setImgAlpha] = createSignal(1);

  return (
    <span
      style={{
        'background-color': bgColor(),
        'border-radius': '0.5em',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        setBgColor('rgba(20, 20, 20, 0.8)');
        setImgAlpha(0.8);
        e.currentTarget.style.transform = 'scale(1.01)';
      }}
      onMouseLeave={(e) => {
        setBgColor('rgba(20, 20, 20, 1)');
        setImgAlpha(1);
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onClick={() => {
        navigate(`/library/playlist/${playlist.id}`);
      }}
    >
      <Row
        style={{
          gap: '0.5em',
          'align-items': 'center',
        }}
      >
        <img
          src={playlist.imgSrc || 'unknown-track.png'}
          style={{
            width: '4em',
            height: '4em',
            'border-radius': '0.5em',
            opacity: imgAlpha(),
          }}
        />
        {playlist.name}
      </Row>
    </span>
  );
}

// TODO: Create `LargePlaylistCard` for `Recently Played`
export function LargePlaylistCard(props: { playlist: Playlist }) {
  return (
    <Column
      style={{
        'justify-content': 'center',
        'align-items': 'center',
        padding: '0.5rem',
        gap: '1em',
      }}
    >
      <img
        src={props.playlist.imgSrc || '/public/unknown-track.png'}
        style={{
          width: '10rem',
          height: '10rem',
        }}
      />
      <span>{props.playlist.name}</span>
      <span>{props.playlist.createdBy}</span>
    </Column>
  );
}
