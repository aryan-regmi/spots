import { authenticateUser, User } from '@/mockApi/User';
import { createSignal, JSX } from 'solid-js';

export function LoginPage() {
  const [invalidLogin, setInvalidLogin] = createSignal(false);
  const [loading, setLoading] = createSignal(false);

  const validateLogin: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (e) => {
    console.log('Clicked!');

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
            e.currentTarget.reset();
            setLoading(false);
          } else {
            setInvalidLogin(true);
            setLoading(false);
          }
        }
      );
    }
  };

  /* The form part of the login page. */
  function LoginForm() {
    const submitDisabled = () => loading() === true || invalidLogin() === true;

    return (
      <form onsubmit={validateLogin}>
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

        <button
          type="submit"
          disabled={submitDisabled()}
          style={submitDisabled() ? DisableBtnStyle : {}}
        >
          Submit
        </button>
      </form>
    );
  }

  const DisableBtnStyle = {
    outline: 'none',
    'border-color': 'gray',
    'background-color': 'gray',
    cursor: 'not-allowed',
  };

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
