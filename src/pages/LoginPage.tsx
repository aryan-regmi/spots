import { Accessor, createSignal, onMount, Setter } from 'solid-js';
import { Column } from '@/components/Column';
import { Effect, Either } from 'effect';
import { JSX } from 'solid-js/h/jsx-runtime';
import { A, Navigator, useNavigate } from '@solidjs/router';
import { getAuthUser, useAuth } from '@/auth/mockAuthServiceProvider';

const BG_COLOR = 'rgba(50, 100, 50, 1)';

/** The login page for the app. */
export function LoginPage() {
  const navigate = useNavigate();

  /** Redirects to dashboard if user is already logged in. */
  const redirectToDashboard = Effect.gen(function* () {
    const authUser = yield* getAuthUser;
    if (authUser.username) {
      navigate('/dashboard', { replace: true });
    }
  });

  /** Run `redirectToDashboard` when component is mounted. */
  onMount(() => Effect.runFork(redirectToDashboard));

  /** The error message to display. */
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null);

  const HeaderStyle: JSX.CSSProperties = {
    'background-color': BG_COLOR,
    width: '100%',
    'align-self': 'center',
    'border-radius': '0.5rem',
    cursor: 'default',
    '-webkit-user-select': 'none',
  };

  return (
    <Column>
      <span style={HeaderStyle}>
        <h1>Spots</h1>
      </span>

      <span style={{ 'margin-top': '5rem' }}>
        <LoginForm navigate={navigate} setErrorMsg={setErrorMsg} />
      </span>

      <span style={{ 'margin-top': '-2rem', 'margin-bottom': '1rem' }}>
        <ErrorMessage errorMsg={errorMsg} />
      </span>

      <A href="/signup" style={{ 'margin-top': '-2rem' }}>
        Sign Up
      </A>
    </Column>
  );
}

/** The form part of the login page. */
function LoginForm(props: {
  navigate: Navigator;
  setErrorMsg: Setter<string | null>;
}) {
  const { authenticate } = useAuth();

  /** Determines if the login is invalid. */
  const [invalidLogin, setInvalidLogin] = createSignal(false);

  /** Determines if the page is in a loading state. */
  const [loading, setLoading] = createSignal(false);

  /** Validates the login provided in the form. */
  const validateLogin: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (e) => {
    /** Updates the error string. */
    const setLoginErrors = (error: string) =>
      Effect.gen(function* () {
        setInvalidLogin(true);
        setLoading(false);
        props.setErrorMsg(error);
      });

    /** Validates the username and password, then authenticates the login. */
    const validateAndAuthenticate = Effect.gen(function* () {
      e.preventDefault();
      setLoading(true);

      // Extract form data
      const formData = new FormData(e.currentTarget);
      const usernameInput = formData.get('username');
      const passwordInput = formData.get('password');

      // FIXME: Add real username and password validation

      // Username validation
      let username = '';
      if (usernameInput) {
        username = usernameInput.toString();
      } else if (!usernameInput || username.length <= 0) {
        const error = 'Username must be non-empty';
        yield* setLoginErrors(error);
        return;
      }

      // Password validation
      let password = '';
      if (passwordInput) {
        password = passwordInput.toString();
      } else if (!passwordInput || password.length <= 0) {
        const error = 'Password must be non-empty';
        yield* setLoginErrors(error);
        return;
      }

      const authResult = yield* Effect.either(authenticate(username, password));

      // Valid user
      if (Either.isRight(authResult)) {
        setInvalidLogin(false);
        props.navigate('/dashboard', { replace: true });
      }

      // Invalid user
      else {
        setInvalidLogin(true);
        props.setErrorMsg(authResult.left.message);
      }

      setLoading(false);
    });

    Effect.runFork(validateAndAuthenticate);
  };

  /** Determines if the submit button is disabled.
   *
   * It will be disabled during loading and if the login is invalid.
   * */
  const submitDisabled = () => loading() === true || invalidLogin() === true;

  const resetInput = Effect.gen(function* () {
    setInvalidLogin(false);
    props.setErrorMsg(null);
  });

  /** Style for the input columns. */
  const innerColumnStyle: JSX.CSSProperties = {
    'align-self': 'center',
    width: '15rem',
    gap: '0rem',
  };

  /** Style for the submit button. */
  const btnStyle: JSX.CSSProperties = {
    'margin-top': '1.75rem',
    'border-radius': '2rem',
    'align-self': 'center',
    width: '10rem',
    background:
      'linear-gradient(45deg, rgba(50, 100, 50, 0.5) 0%, rgba(40, 175, 40, 0.9) 50%)',
  };

  // FIXME:  Change button style when hovered!
  const hoveredBtnStyle = {
    ...btnStyle,
    background:
      'linear-gradient(deg, rgba(50, 150, 50, 1) 0%, rgba(50, 200, 50, 1) 50%)',
  };

  /** Style for the disabled button. */
  const disableBtnStyle = {
    ...btnStyle,
    outline: 'none',
    background: 'none',
    'background-color': 'rgba(20, 30, 20, 0.5)',
    cursor: 'not-allowed',
  };

  const inputStyle: JSX.CSSProperties = {
    'align-self': 'center',
    'border-radius': '2rem',
    'padding-top': '1rem',
    'padding-bottom': '1rem',
    width: '15rem',
    'border-style': 'ridge',
    'border-color': 'rgba(255, 255, 255, 0.1)',
  };

  return (
    <form onSubmit={validateLogin}>
      <Column style={{ gap: '1.5rem' }}>
        {/* Username input */}
        <Column style={innerColumnStyle}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            oninput={() => Effect.runFork(resetInput)}
            style={inputStyle}
          />
        </Column>

        {/* Password input */}
        <Column style={innerColumnStyle}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            oninput={() => Effect.runFork(resetInput)}
            style={inputStyle}
          />
        </Column>

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitDisabled()}
          style={submitDisabled() ? disableBtnStyle : btnStyle}
        >
          {loading() ? 'Logging in...' : 'Log In'}
        </button>
      </Column>
    </form>
  );
}

/** Displays error message(s) for login page. */
function ErrorMessage(props: { errorMsg: Accessor<string | null> }) {
  const { errorMsg } = props;
  return (
    <>
      {errorMsg() ? (
        <p style={{ color: 'red' }}>
          <strong>Invalid login:</strong> {errorMsg()}
        </p>
      ) : (
        <></>
      )}
    </>
  );
}
