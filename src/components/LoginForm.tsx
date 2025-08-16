import { FormEvent, useState } from "react";

/** The data returned by the `LoginForm` component. */
export type LoginFormData = {
  username: string,
  password: string
};

/** The type of the function that handles the data returned by the `LoginForm` component. */
export type LoginDataHandlerFn = (data: LoginFormData) => void;

// FIXME: Add validation.
// 
/** The component responsible for handling user logins. */
export function LoginForm(props: { loginDataHandler: LoginDataHandlerFn }) {
  const { loginDataHandler } = props;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    loginDataHandler({ username: username, password: password });
  }

  return (
    <form className="login-form col" onSubmit={handleSubmit}>
      <div className="row">
        Username:
        <input
          id="username-input"
          onChange={(e) => setUsername(e.currentTarget.value)}
          placeholder="Enter username..."
        />
      </div>

      <div className="row">
        Password:
        <input
          id="password-input"
          type="password"
          onChange={(e) => setPassword(e.currentTarget.value)}
          placeholder="Enter password..."
        />
      </div>

      <input type="submit" placeholder="Login" className="submit-button" />
    </form>
  );
}
