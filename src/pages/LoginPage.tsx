import useAuth from '@/auth/useAuth';
import { Accessor, createSignal, JSX, onMount, Setter } from 'solid-js';
import { Navigator, useNavigate } from '@solidjs/router';
import { AuthenticationError } from '@/auth/AuthProvider';
import { Effect, Either } from 'effect';

/** The login page for the app. */
export function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  if (!auth) {
    return;
  }

  /** Redirects to dashboard if user is already logged in. */
  onMount(() => {
    if (auth.authUser()) {
      navigate('/dashboard', { replace: true });
    }
  });

  /** Determines if the login is invalid. */
  const [invalidLogin, setInvalidLogin] = createSignal(false);

  /** Determines if the page is in a loading state. */
  const [loading, setLoading] = createSignal(false);

  /** The error message to display. */
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null);

  return (
    <div>
      <h1>Spots</h1>
      <br />
      <br />
      <LoginForm
        authenticate={auth.authenticate}
        navigate={navigate}
        loading={loading}
        setLoading={setLoading}
        invalidLogin={invalidLogin}
        setInvalidLogin={setInvalidLogin}
        setErrorMsg={setErrorMsg}
      />

      {errorMsg() ? (
        <p style={{ color: 'red' }}>
          <strong>Invalid login:</strong> {errorMsg()}
        </p>
      ) : (
        <></>
      )}
    </div>
  );
}

/** The form part of the login page. */
function LoginForm(props: {
  authenticate: (
    username: string,
    password: string
  ) => Effect.Effect<void, AuthenticationError, never>;
  navigate: Navigator;
  loading: Accessor<boolean>;
  setLoading: Setter<boolean>;
  invalidLogin: Accessor<boolean>;
  setInvalidLogin: Setter<boolean>;
  setErrorMsg: Setter<string | null>;
}) {
  /** Validates the login provided in the form. */
  const validateLogin: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (
    e
  ) => {
    /** Updates the error string. */
    const setLoginErrors = (error: string) =>
      Effect.gen(function* () {
        props.setInvalidLogin(true);
        props.setLoading(false);
        props.setErrorMsg(error);
      });

    /** Authenticates the login. */
    const authenticateLogin = (usernameStr: string, passwordStr: string) =>
      Effect.gen(function* () {
        const authenticatedResult = yield* Effect.either(
          props.authenticate(usernameStr, passwordStr)
        );
        if (Either.isRight(authenticatedResult)) {
          props.setInvalidLogin(false);
          props.setLoading(false);
          props.navigate('/dashboard', { replace: true });
        } else {
          props.setInvalidLogin(true);
          props.setLoading(false);
          props.setErrorMsg(authenticatedResult.left.message);
        }
      });

    /** Validates the username and password, then authenticates the login. */
    const validateAndAuthenticate = Effect.gen(function* () {
      e.preventDefault();
      props.setLoading(true);

      // Extract form data
      const formData = new FormData(e.currentTarget);
      const username = formData.get('username');
      const password = formData.get('password');

      // FIXME: Add real username and password validation
      let usernameStr = '';
      let passwordStr = '';

      // Username validation
      if (username) {
        usernameStr = username.toString();
      } else if (!username || usernameStr.length <= 0) {
        yield* setLoginErrors('Username must be non-empty');
        return;
      }

      // Password validation
      if (password) {
        passwordStr = password.toString();
      } else if (!password || passwordStr.length <= 0) {
        yield* setLoginErrors('Password must be non-empty');
        return;
      }

      yield* authenticateLogin(usernameStr, passwordStr);
    });

    Effect.runFork(validateAndAuthenticate);
  };

  /** Determines if the submit button is disabled.
   *
   * It will be disabled during loading and if the login is invalid.
   * */
  const submitDisabled = () =>
    props.loading() === true || props.invalidLogin() === true;

  /** Style for the disabled button. */
  const DisableBtnStyle = {
    outline: 'none',
    'border-color': 'gray',
    'background-color': 'gray',
    cursor: 'not-allowed',
  };

  const resetInput = Effect.gen(function* () {
    props.setInvalidLogin(false);
    props.setErrorMsg(null);
  });

  // TODO: Replace hard coded spaces with `Row` and `Column` components!
  return (
    <form onsubmit={validateLogin}>
      {/* Username input */}
      <label for="username">
        <strong>Username</strong>
      </label>
      <br />
      <input
        type="text"
        name="username"
        placeholder="Enter username..."
        oninput={() => Effect.runFork(resetInput)}
      />
      <br />
      <br />

      {/* Password input */}
      <label for="password">
        <strong>Password</strong>
      </label>
      <br />
      <input
        type="password"
        name="password"
        placeholder="Enter password..."
        oninput={() => Effect.runFork(resetInput)}
      />
      <br />
      <br />

      {/* Submit button */}
      <button
        type="submit"
        disabled={submitDisabled()}
        style={submitDisabled() ? DisableBtnStyle : {}}
      >
        {props.loading() ? 'Logging in...' : 'Submit'}
      </button>
    </form>
  );
}
