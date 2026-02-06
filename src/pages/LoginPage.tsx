import { A, Navigator, useNavigate } from '@solidjs/router';
import { Accessor, createSignal, onMount, Setter } from 'solid-js';
import { Column } from '@/components/Column';
import { JSX } from 'solid-js/h/jsx-runtime';
import { useAuthService } from '@/authService/mockAuthServiceProvider';

const BG_COLOR = 'rgba(50, 100, 50, 1)';

/** The login page for the app. */
export function LoginPage() {
  const navigate = useNavigate();
  const authService = useAuthService();

  /** Redirects to dashboard if user is already logged in. */
  onMount(() => {
    if (authService.authUser !== null) {
      navigate('/dashboard', { replace: true });
    }
  });

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

      <A href="/signup">Sign Up</A>
    </Column>
  );
}

// FIXME: Use solidjs-router `action` to replace validation etc

/** The form part of the login page. */
function LoginForm(props: {
  navigate: Navigator;
  setErrorMsg: Setter<string | null>;
}) {
  const { authenticate } = useAuthService();

  /** Determines if the login is invalid. */
  const [invalidLogin, setInvalidLogin] = createSignal(false);

  /** Determines if the page is in a loading state. */
  const [loading, setLoading] = createSignal(false);

  /** Determines if the submit button is disabled.
   *
   * It will be disabled during loading and if the login is invalid.
   * */
  const submitDisabled = () => loading() === true || invalidLogin() === true;

  /** Updates the error string. */
  function setLoginErrors(error: string) {
    setInvalidLogin(true);
    setLoading(false);
    props.setErrorMsg(error);
  }

  /** Resets the displayed error message. */
  function resetInput() {
    setInvalidLogin(false);
    props.setErrorMsg(null);
  }

  // FIXME: Add real username and password validation (Zod)

  /** Validates the username input. */
  function validateUsername(usernameInput: FormDataEntryValue | null) {
    let username = usernameInput ? usernameInput.toString() : null;
    if (username && username.length > 0) {
      return { isValid: true, username };
    }
    setLoginErrors('Username must be non-empty');
    return { isValid: false, username };
  }

  /** Validates the password input. */
  function validatePassword(passwordInput: FormDataEntryValue | null) {
    let password = passwordInput ? passwordInput.toString() : null;
    if (password && password.length > 0) {
      return { isValid: true, password };
    }
    setLoginErrors('password must be non-empty');
    return { isValid: false, password };
  }

  /** Validates and authenticates the login provided in the form. */
  const validateLogin: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (e) => {
    e.preventDefault();
    setLoading(true);

    // Extract form data
    const formData = new FormData(e.currentTarget);
    const usernameInput = formData.get('username');
    const passwordInput = formData.get('password');

    // Validation
    const username = validateUsername(usernameInput);
    const password = validatePassword(passwordInput);

    // Authentication
    if (username.isValid && password.isValid) {
      authenticate(username.username!, password.password!).match(
        (_ok) => {
          setInvalidLogin(false);
          props.navigate('/dashboard', { replace: true });
        },
        (err) => {
          setInvalidLogin(true);
          props.setErrorMsg(err.message);
        }
      );
    }

    setLoading(false);
  };

  /** Style for the input columns. */
  const innerColumnStyle: JSX.CSSProperties = {
    'align-self': 'center',
    width: '15rem',
    gap: '0rem',
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
            oninput={() => resetInput}
            style={inputStyle}
          />
        </Column>

        {/* Password input */}
        <Column style={innerColumnStyle}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            oninput={() => resetInput}
            style={inputStyle}
          />
        </Column>

        {/* Submit button */}
        <SubmitButton loading={loading} submitDisabled={submitDisabled} />
      </Column>
    </form>
  );
}

/** The submit button. */
function SubmitButton(props: {
  loading: Accessor<boolean>;
  submitDisabled: () => boolean;
}) {
  const [isHovered, setIsHovered] = createSignal(false);

  /** Style for the submit button. */
  const btnStyle: () => JSX.CSSProperties = () => ({
    'margin-top': '1.75rem',
    'border-radius': '2rem',
    'align-self': 'center',
    width: '10rem',
    background:
      'linear-gradient(45deg, rgba(50, 100, 50, 0.5) 0%, rgba(40, 175, 40, 0.9) 50%)',
    transform: isHovered() ? 'scale(1.1)' : 'scale(1)',
  });

  /** Style for the disabled button. */
  const disableBtnStyle = {
    ...btnStyle,
    outline: 'none',
    background: 'none',
    'background-color': 'rgba(20, 30, 20, 0.5)',
    cursor: 'not-allowed',
  };

  return (
    <button
      type="submit"
      disabled={props.submitDisabled()}
      style={props.submitDisabled() ? disableBtnStyle : btnStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {props.loading() ? 'Logging in...' : 'Log In'}
    </button>
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
