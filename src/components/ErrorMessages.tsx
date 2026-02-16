import { For, JSX } from 'solid-js';

/** Component to display error messages. */
export function ErrorMessages(props: { errors: (string | Error)[] }) {
  const containerStyle: JSX.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    'overflow-y': 'auto',
    padding: '2rem',
    'box-sizing': 'border-box',
    'align-self': 'center',
  };

  const errorStyle: JSX.CSSProperties = {
    'background-color': 'rgba(100, 20, 40, 0.8)',
    padding: '1rem',
    width: '95%',
    'margin-bottom': '1rem',
    'border-radius': '0.5rem',
    'text-align': 'center',
    'backdrop-filter': 'blur(10px)',
    'box-shadow': 'none',
  };

  return (
    <div style={containerStyle}>
      <For each={props.errors}>
        {(error) => {
          let errMsg: string;
          error instanceof Error ? (errMsg = error.message) : (errMsg = error);
          return <div style={errorStyle}>{errMsg}</div>;
        }}
      </For>
    </div>
  );
}
