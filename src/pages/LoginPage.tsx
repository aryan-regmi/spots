import { authenticateUser } from '@/mockApi/User';
import { useNavigate } from '@solidjs/router';
import { createSignal, JSX } from 'solid-js';

/** The login page for the app. */
export function LoginPage() {
  const navigate = useNavigate();

  /** Determines if the login is invalid. */
  const [invalidLogin, setInvalidLogin] = createSignal(false);

  /** Determines if the page is in a loading state. */
  const [loading, setLoading] = createSignal(false);

  /** Validates the login provided in the form. */
  const validateLogin: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (e) => {
    e.preventDefault();
    setLoading(true);

    // Extract form data
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username');
    const password = formData.get('password');

    // Authenticate the login
    if (username && password) {
      authenticateUser(username.toString(), password.toString()).then(
        (authUser) => {
          if (authUser) {
            setInvalidLogin(false);
            setLoading(false);
            navigate('/dashboard', { replace: true });
            return;
          } else {
            setInvalidLogin(true);
            setLoading(false);
          }
        }
      );
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
          oninput={() => setInvalidLogin(false)}
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
          oninput={() => setInvalidLogin(false)}
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
      {invalidLogin() ? <p>Invalid Login!</p> : <></>}
    </div>
  );
}
