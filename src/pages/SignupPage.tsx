import { ErrorMessages } from '@/components/ErrorMessages';
import { useAuth } from '@/services/auth/provider';
import { AuthError } from '@/services/auth/service';
import { useLogger } from '@/services/logger/provider';
import { A, useAction, useNavigate } from '@solidjs/router';
import { createSignal, ErrorBoundary, JSX } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as z from 'zod';

/** Type of styles in the signup page. */
type styles = {
  /** Style for the main container. */
  containerStyle: JSX.CSSProperties;

  /** Style for the header. */
  headerStyle: JSX.CSSProperties;

  /** Style for the form. */
  formStyle: JSX.CSSProperties;

  /** Style for the form inputs. */
  inputStyle: JSX.CSSProperties;

  /** Style for the signup button. */
  submitBtnStyle: JSX.CSSProperties;

  /** Style for the disabled signup button. */
  submitBtnDisabledStyle: JSX.CSSProperties;
};

/** All styles for the signup page.  */
const SignupPageStyles: styles = {
  containerStyle: {
    padding: '2rem',
    'align-items': 'center',
    'align-content': 'center',
    gap: '7em',
  },

  headerStyle: {
    'background-color': 'rgba(20, 50, 100, 0.8)',
    'border-radius': '1rem',
    width: '95%',
    'margin-top': '10rem',
  },

  formStyle: {
    gap: '2rem',
    'font-size': '1.2rem',
    'margin-bottom': '-3rem',
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

/** Various types of errors. */
type Errors = {
  usernameErrors: (string | Error)[];
  passwordErrors: (string | Error)[];
  serverErrors: (string | Error)[];
};

export function SignupPage() {
  const logger = useLogger();
  const navigate = useNavigate();
  const auth = useAuth();
  const createLogin = useAction(auth.createLoginAction);
  const authenticate = useAction(auth.authenticateAction);

  /** Determines if the login page is in a busy state. */
  const [isBusy, setIsBusy] = createSignal(false);

  /** Determines if the button should be disabled */
  const isBtnDisabled = () =>
    isBusy() ||
    errMsgs.serverErrors.length > 0 ||
    errMsgs.passwordErrors.length > 0 ||
    errMsgs.usernameErrors.length > 0;

  /** List of error messages. */
  const [errMsgs, setErrMsgs] = createStore<Errors>({
    usernameErrors: [],
    passwordErrors: [],
    serverErrors: [],
  });

  /** Handles the signup button click, */
  const handleSignupClicked: JSX.EventHandler<
    HTMLFormElement,
    SubmitEvent
  > = async (e) => {
    setIsBusy(true);
    e.preventDefault();

    // Get form data
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username')?.toString();
    const password = formData.get('password')?.toString();

    // Validate inputs and then send to backend to validate
    if (username && password) {
      // Validate username and password
      const isValid = await Promise.all([
        usernameIsValid(username ?? ''),
        passwordIsValid(password ?? ''),
      ]).then(
        ([validUsername, validPassword]) => validUsername && validPassword
      );

      if (isValid) {
        // Create login
        const created = await createLogin(username, password);
        if (created instanceof AuthError) {
          logger.error(`${JSON.stringify(created)}`);
          setErrMsgs('serverErrors', (prev) => [...prev, created]);
          setIsBusy(false);
          return;
        }

        // Authenticate and redirect to dashboard
        const authenticated = await authenticate(username);
        if (authenticated instanceof AuthError) {
          setErrMsgs('serverErrors', (prev) => [...prev, authenticated]);
          setIsBusy(false);
          return;
        }
        logger.info('User authenticated');
        navigate('/dashboard', { replace: true });
        setIsBusy(false);
        return;
      }

      // Invalid input (handled by `[]IsValid` functions)
      setIsBusy(false);
      return;
    }

    // Invalid inputs
    setIsBusy(false);
    return;
  };

  /** Validates the username using `UsernameSchema`.*/
  async function usernameIsValid(username: string) {
    const validation = await UsernameSchema.safeParseAsync(username);
    if (validation.success) {
      return true;
    }
    const errObj = JSON.parse(validation.error.message);
    setErrMsgs('usernameErrors', (prev) => [
      ...prev,
      `Invalid username: ${errObj[errObj.length - 1].message}`,
    ]);
    return false;
  }

  /** Validates the password using `PasswordSchema`.*/
  async function passwordIsValid(password: string) {
    const validation = await PasswordSchema.safeParseAsync(password);
    if (validation.success) {
      return true;
    }

    const errObj = JSON.parse(validation.error.message);
    setErrMsgs('passwordErrors', (prev) => [
      ...prev,
      `Invalid password: ${errObj[errObj.length - 1].message}`,
    ]);
    return false;
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
      <div class="col" style={SignupPageStyles.containerStyle}>
        {/* Header */}
        <div style={SignupPageStyles.headerStyle}>
          <h1>Spots</h1>
        </div>

        {/* Signup form */}
        <form
          class="col"
          style={SignupPageStyles.formStyle}
          onSubmit={handleSignupClicked}
        >
          <input
            name="username"
            style={SignupPageStyles.inputStyle}
            type="text"
            placeholder="Username"
            oninput={async (e) => {
              setErrMsgs('usernameErrors', []);
              await usernameIsValid(e.currentTarget.value);
            }}
          />

          <input
            name="password"
            style={SignupPageStyles.inputStyle}
            type="password"
            placeholder="Password"
            oninput={async (e) => {
              setErrMsgs('passwordErrors', []);
              await passwordIsValid(e.currentTarget.value);
            }}
          />

          <button
            type="submit"
            disabled={isBtnDisabled()}
            style={
              isBtnDisabled()
                ? SignupPageStyles.submitBtnDisabledStyle
                : SignupPageStyles.submitBtnStyle
            }
          >
            {isBusy() ? 'Creating login...' : 'Sign Up'}
          </button>
        </form>

        {/* Login link */}
        <div
          style={{
            'font-size': '0.8rem',
          }}
        >
          Already have a user? <A href="/">Log In</A>
        </div>
      </div>

      {/* Error Messages */}
      <ErrorMessages
        errors={[
          ...errMsgs.serverErrors,
          ...errMsgs.usernameErrors,
          ...errMsgs.passwordErrors,
        ]}
      />
    </ErrorBoundary>
  );
}

/** Schema to parse username. */
const UsernameSchema = z
  .string()
  .max(64, 'Username can be a max of 64 characters')
  .min(1, 'Username must not be empty')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username must not be empty and must be only alpha-numeric characters'
  );

/** Schema to parse password. */
const PasswordSchema = z
  .string()
  .max(128, 'Password can be a max of 64 characters')
  .min(8, 'Password must be at least 8 characters long')
  .refine((value) => {
    const containsSpecialCharacter = /\W/.test(value);
    const containsUppercase = /[A-Z]/.test(value);
    return containsUppercase && containsSpecialCharacter;
  }, 'Password must contain a special character and and uppercase character');
