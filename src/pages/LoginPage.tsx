import useAuth from '@/auth/useAuth';
import { createSignal, JSX } from 'solid-js';
import { useNavigate } from '@solidjs/router';

/** The login page for the app. */
export function LoginPage() {
  const navigate = useNavigate();
  const { authenticate } = useAuth();

  /** Determines if the login is invalid. */
  const [invalidLogin, setInvalidLogin] = createSignal(false);

  /** Determines if the page is in a loading state. */
  const [loading, setLoading] = createSignal(false);

  /** The error message to display. */
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null);

  /** Validates the login provided in the form. */
  const validateLogin: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (
    e
  ) => {
    e.preventDefault();
    setLoading(true);

    // Extract form data
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username');
    const password = formData.get('password');

    function setLoginErrors(error: string) {
      setInvalidLogin(true);
      setLoading(false);
      setErrorMsg(error);
    }

    // FIXME: Add real username and password validation
    let usernameStr = '';
    let passwordStr = '';
    if (username) {
      usernameStr = username.toString();
    } else if (!username || usernameStr.length <= 0) {
      setLoginErrors('username must be non-empty');
      return;
    }

    if (password) {
      passwordStr = password.toString();
    } else if (!password || passwordStr.length <= 0) {
      setLoginErrors('password must be non-empty');
      return;
    }

    // Authenticate the login
    try {
      await authenticate(usernameStr, passwordStr);
      setInvalidLogin(false);
      setLoading(false);
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      setInvalidLogin(true);
      setLoading(false);
      setErrorMsg(error);
    }
  };

  /** The form part of the login page. */
  function LoginForm() {
    /** Determines if the submit button is disabled.
     *
     * It will be disabled during loading and if the login is invalid.
     * */
    const submitDisabled = () => loading() === true || invalidLogin() === true;

    /** Style for the disabled button. */
    const DisableBtnStyle = {
      outline: 'none',
      'border-color': 'gray',
      'background-color': 'gray',
      cursor: 'not-allowed',
    };

    function resetInput() {
      setInvalidLogin(false);
      setErrorMsg(null);
    }

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
          oninput={resetInput}
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
          oninput={resetInput}
        />
        <br />
        <br />

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitDisabled()}
          style={submitDisabled() ? DisableBtnStyle : {}}
        >
          {loading() ? 'Logging in...' : 'Submit'}
        </button>
      </form>
    );
  }

  return (
    <div>
      <h1>Spots</h1>
      <br />
      <br />
      <LoginForm />
      {errorMsg() ? <p>Invalid login: {errorMsg()}</p> : <></>}
    </div>
  );
}
