// import "@/App.css";

import { createSignal, JSX } from 'solid-js';

/** The login page. */
export function LoginPage() {
  /** Determines if the login page is in a busy state. */
  const [isBusy, setIsBusy] = createSignal(false);

  /** Style for the main container. */
  const containerStyle: JSX.CSSProperties = {
    padding: '2rem',
    'align-items': 'center',
    'align-content': 'center',
    gap: '7em',
    'backdrop-filter': 'blur(10px)',
  };

  /** Style for the header. */
  const headerStyle: JSX.CSSProperties = {
    'background-color': 'rgba(20, 50, 100, 0.8)',
    'border-radius': '1rem',
    width: '25rem',
    'margin-top': '3rem',
  };

  /** Style for the form. */
  const formStyle: JSX.CSSProperties = {
    gap: '2rem',
    'font-size': '1.2rem',
  };

  /** Style for the form inputs. */
  const inputStyle: JSX.CSSProperties = {
    width: '20rem',
    'background-color': 'black',
    color: 'rgba(200, 200, 255, 0.9)',
    'border-radius': '2rem',
    'border-style': 'ridge',
    'border-color': 'rgba(20, 50, 100, 0.5)',
  };

  /** Style for the login button. */
  const buttonStyle: JSX.CSSProperties = {
    'background-color': 'rgba(100, 100, 200, 0.9)',
    'margin-top': '1.5em',
  };

  return (
    <div class="col" style={containerStyle}>
      <div style={headerStyle}>
        <h1>Spots</h1>
      </div>
      <form class="col" style={formStyle}>
        <input style={inputStyle} type="text" placeholder="Username" />
        <input style={inputStyle} type="text" placeholder="Password" />
        <button type="submit" style={buttonStyle}>
          Log In
        </button>
      </form>
    </div>
  );
}
