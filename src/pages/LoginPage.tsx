// import "@/App.css";

import { createSignal, ErrorBoundary, JSX } from 'solid-js';

/** Type of styles in the login page. */
type styles = {
  /** Style for the main container. */
  containerStyle: JSX.CSSProperties;

  /** Style for the header. */
  headerStyle: JSX.CSSProperties;

  /** Style for the form. */
  formStyle: JSX.CSSProperties;

  /** Style for the form inputs. */
  inputStyle: JSX.CSSProperties;

  /** Style for the login button. */
  submitBtnStyle: JSX.CSSProperties;

  /** Style for the disabled login button. */
  submitBtnDisabledStyle: JSX.CSSProperties;
};

/** All styles for the login page.  */
const LoginPageStyles: styles = {
  containerStyle: {
    padding: '2rem',
    'align-items': 'center',
    'align-content': 'center',
    gap: '7em',
    'backdrop-filter': 'blur(20px)',
  },

  headerStyle: {
    'background-color': 'rgba(20, 50, 100, 0.8)',
    'border-radius': '1rem',
    width: '25rem',
    'margin-top': '3rem',
  },

  formStyle: {
    gap: '2rem',
    'font-size': '1.2rem',
  },

  inputStyle: {
    width: '20rem',
    'background-color': 'black',
    color: 'rgba(200, 200, 255, 0.9)',
    'border-radius': '2rem',
    'box-shadow': '0 1px 1px',
  },

  submitBtnStyle: {
    'background-color': 'rgba(50, 50, 150, 1)',
    'margin-top': '3rem',
    'box-shadow': '0 1px 1px black',
    'border-radius': '1rem',
  },

  submitBtnDisabledStyle: {
    'background-color': 'rgba(50, 50, 55, 1)',
    'margin-top': '3rem',
    'box-shadow': '0 1px 1px black',
    'border-radius': '1rem',
    cursor: 'not-allowed',
  },
};

/** The login page. */
export function LoginPage() {
  /** Determines if the login page is in a busy state. */
  const [isBusy, setIsBusy] = createSignal(false);

  /** Handles login button click. */
  async function handleLoginClicked(e: Event) {
    setIsBusy(true);
    e.preventDefault();
    console.debug('Logging In!');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsBusy(false);
    console.debug('Logged In!');
    // TODO: Validate and authenticate in backend
  }

  {
    /* TODO: Add real error fallback component */
  }
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div>
          <p>{error.message}</p>
          <button onClick={reset}>Try Again</button>
        </div>
      )}
    >
      <div class="col" style={LoginPageStyles.containerStyle}>
        <div style={LoginPageStyles.headerStyle}>
          <h1>Spots</h1>
        </div>
        <form class="col" style={LoginPageStyles.formStyle}>
          <input
            style={LoginPageStyles.inputStyle}
            type="text"
            placeholder="Username"
          />
          <input
            style={LoginPageStyles.inputStyle}
            type="text"
            placeholder="Password"
          />
          <button
            type="submit"
            style={
              isBusy()
                ? LoginPageStyles.submitBtnDisabledStyle
                : LoginPageStyles.submitBtnStyle
            }
            onclick={handleLoginClicked}
          >
            {isBusy() ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </ErrorBoundary>
  );
}
