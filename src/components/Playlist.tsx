import { createSignal, JSX } from 'solid-js';
import { Row } from '@/components/Row';

export type Playlist = {
  id: string;
  name: string;
  imgSrc?: string;
};

/** Type for recent playlists (max of 6). */
export type PlaylistList = [
  Playlist?,
  Playlist?,
  Playlist?,
  Playlist?,
  Playlist?,
  Playlist?,
];

/** Displays up to six pinned playlists. */
export function PinnedPlaylists(props: { playlists: PlaylistList }) {
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
          if (playlist) {
            return <PlaylistCard playlist={playlist} />;
          }
        })}
      </div>
    </>
  );
}

/** A card for a playlist. */
export function PlaylistCard(props: { playlist: Playlist }) {
  const playlist = props.playlist;

  // Background color of the card.
  // Needed to change the color on hover.
  const [bgColor, setBgColor] = createSignal('rgba(20, 20, 20, 1)');
  const [imgAlpha, setImgAlpha] = createSignal(1);

  return (
    <span
      style={{
        'background-color': bgColor(),
        'border-radius': '0.5em',
      }}
      onMouseEnter={() => {
        setBgColor('rgba(20, 20, 20, 0.8)');
        setImgAlpha(0.8);
      }}
      onMouseLeave={() => {
        setBgColor('rgba(20, 20, 20, 1)');
        setImgAlpha(1);
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
            'margin-left': '0',
            'border-radius': '0.5em',
            opacity: imgAlpha(),
          }}
        />
        {playlist.name}
      </Row>
    </span>
  );
}
