import { extractError, SpotsError } from '@/utils/errors';
import { Accessor, For, JSX, Setter } from 'solid-js';

/** Component to display error messages. */
export function ErrorMessages(props: {
  errors: Accessor<SpotsError[]>;
  setErrors: Setter<SpotsError[]>;
}) {
  const uniqueErrors = () => [
    ...new Set(props.errors().map((e) => JSON.stringify(e))),
  ];

  const containerStyle: JSX.CSSProperties = {
    'white-space': 'pre',
    position: 'fixed',
    bottom: 0,
    'overflow-y': 'auto',
    'box-sizing': 'border-box',
    'align-self': 'center',
    'backdrop-filter': 'none',
    'box-shadow': 'none',
  };

  const errorStyle: JSX.CSSProperties = {
    'background-color': 'rgba(100, 20, 40, 0.8)',
    padding: '1rem',
    'margin-bottom': '1rem',
    'border-radius': '0.5rem',
    'text-align': 'center',
    cursor: 'pointer',
  };

  const dismissError: JSX.EventHandler<HTMLElement, MouseEvent> = (e) => {
    const errMsg = e.currentTarget.innerText;
    let err: SpotsError;
    if (
      uniqueErrors().filter((s, idx) => {
        err = JSON.parse(uniqueErrors()[idx]);
        return s.includes(errMsg.split(':')[0]);
      }).length > 0
    ) {
      props.setErrors((prev) => {
        return prev.filter((e) => {
          return JSON.stringify(e.kind) !== JSON.stringify(err.kind);
        });
      });
    }
  };

  return (
    <div style={containerStyle}>
      <For each={uniqueErrors()}>
        {(errorString) => {
          const error: SpotsError = JSON.parse(errorString);
          const errorData = extractError(error);
          return (
            <div style={errorStyle} onClick={dismissError}>
              <span style={{ 'padding-left': '2rem' }}>
                <strong>{errorData.kind}</strong>: {errorData.message}
              </span>
            </div>
          );
        }}
      </For>
    </div>
  );
}
