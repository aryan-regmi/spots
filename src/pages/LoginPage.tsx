import { AuthError } from '@/services/auth/service';
import { createSignal, ErrorBoundary, JSX, Show } from 'solid-js';
import { useAction } from '@solidjs/router';
import { useAuth } from '@/services/auth/provider';

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
    width: '80%',
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

// TODO: add real logger service instead of console

/** The login page. */
export function LoginPage() {
  const auth = useAuth();
  const hashLogin = useAction(auth.hashAction);
  const validateLogin = useAction(auth.validateAction);
  const authenticate = useAction(auth.authenticateAction);

  /** Determines if the login page is in a busy state. */
  const [isBusy, setIsBusy] = createSignal(false);

  /** List of error messages. */
  const [errMsgs, setErrMsgs] = createSignal<(string | Error)[]>([]);

  /** List of unique error messages. */
  const uniqueErrMsgs = () => [
    ...new Set(
      errMsgs().map((e) =>
        e instanceof AuthError ? `${e.name}: ${e.kind}: ${e.message}` : e
      )
    ),
  ];

  /** Determines if the button should be disabled */
  const isBtnDisabled = () => isBusy() || uniqueErrMsgs().length > 0;

  /** Handles login button click. */
  const handleLoginClicked: JSX.EventHandler<
    HTMLFormElement,
    SubmitEvent
  > = async (e) => {
    setIsBusy(true);
    e.preventDefault();

    // Validate and authenticate in backend
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username')?.toString();
    const password = formData.get('password')?.toString();
    if (username && password) {
      console.debug('Logging In!');

      // Validate
      const isValid = await validateLogin(username, password);
      if (isValid instanceof AuthError) {
        setErrMsgs((prev) => [...prev, isValid]);
        setIsBusy(false);
        return;
      }

      // Authenticate
      if (isValid) {
        // Hash the login
        const hashedResult = await hashLogin(username, password);
        if (hashedResult instanceof AuthError) {
          setErrMsgs((prev) => [...prev, hashedResult]);
          return;
        }

        const authenticatedResult = await authenticate(
          hashedResult.hashedUsername,
          hashedResult.hashedPassword
        );
        authenticatedResult instanceof AuthError
          ? setErrMsgs((prev) => [...prev, authenticatedResult])
          : console.debug('User authenticated');
        setIsBusy(false);
        return;
      }
    }

    // Empty inputs
    setErrMsgs((prev) => [...prev, 'Username and password must not be empty']);
    setIsBusy(false);
    return;
  };

  // TODO: Add real error fallback component
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
        {/* Header */}
        <div style={LoginPageStyles.headerStyle}>
          <h1>Spots</h1>
        </div>

        {/* Login form */}
        <form
          class="col"
          style={LoginPageStyles.formStyle}
          onsubmit={handleLoginClicked}
        >
          <input
            name="username"
            style={LoginPageStyles.inputStyle}
            type="text"
            placeholder="Username"
            oninput={() => setErrMsgs([])}
          />
          <input
            name="password"
            style={LoginPageStyles.inputStyle}
            type="text"
            placeholder="Password"
            oninput={() => setErrMsgs([])}
          />
          <button
            type="submit"
            disabled={isBtnDisabled()}
            style={
              isBtnDisabled()
                ? LoginPageStyles.submitBtnDisabledStyle
                : LoginPageStyles.submitBtnStyle
            }
          >
            {isBusy() ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Error Messages */}
        <div style={{ 'margin-top': '-3rem', color: 'red' }}>
          <Show when={errMsgs().length > 0}>
            <strong>{'Error:'}</strong>
            <span>
              <ul>
                {uniqueErrMsgs().map((msg) => {
                  return msg instanceof AuthError ? (
                    <li>{`${msg.kind}:${msg.message}:${msg.info}`}</li>
                  ) : (
                    <li>{msg as string}</li>
                  );
                })}
              </ul>
            </span>
          </Show>
        </div>
      </div>
    </ErrorBoundary>
  );
}
