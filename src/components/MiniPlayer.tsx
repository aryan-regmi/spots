import { JSX } from 'solid-js/h/jsx-runtime';

/** The mini music player component. */
export function MiniPlayer() {
  const styles = miniPlayerStyles();

  return (
    <div class="col" style={styles.containerStyle}>
      {/* TODO: Add the following:
          - Current track image
          - Current track name
          - Current track artist
          - Current track position + total duration
          - Play/Pause & Prev/Next buttons
       */}
      <p>hi</p>
      <p>bye</p>
    </div>
  );
}

/** Styles for the `MiniPlayer`. */
function miniPlayerStyles() {
  const containerStyle: JSX.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    margin: '8.25rem 2rem',
    'backdrop-filter': 'blur(10px)',
    'background-color': 'rgba(20, 20, 20, 0.7)',
    'border-top': '1px solid rgba(100, 100, 100, 0.2)',
    'border-bottom': '1px solid rgba(100, 100, 100, 0.2)',
    'border-radius': '1rem',
    'z-index': 200,
    'justify-content': 'left',
  };

  return {
    containerStyle,
  };
}
