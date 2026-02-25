import { Accessor, createSignal, For, JSX, Setter } from 'solid-js';

/** Component to display error messages. */
export function ErrorMessages(props: {
  errors: Accessor<string[]>;
  setErrors: Setter<string[]>;
}) {
  const uniqueErrors = () => [...new Set(props.errors())];

  const containerStyle: JSX.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    'overflow-y': 'auto',
    width: '95%',
    'box-sizing': 'border-box',
    'align-self': 'center',
    'backdrop-filter': 'blur(10px)',
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
    if (props.errors().includes(errMsg)) {
      props.setErrors((prev) => prev.filter((e) => e != errMsg));
    }
  };

  return (
    <div style={containerStyle}>
      <For each={uniqueErrors()}>
        {(error) => {
          return (
            <div style={errorStyle} onClick={dismissError}>
              {error}
            </div>
          );
        }}
      </For>
    </div>
  );
}
