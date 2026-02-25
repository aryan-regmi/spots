import { registerUserAction } from '@/api/auth';
import { ErrorMessages } from '@/components/ErrorMessages';
import { extractError, SpotsError } from '@/utils/errors';
import { Logger } from '@/utils/logger';
import { useStore } from '@/utils/tauriStore';
import { A, useNavigate, useSubmission } from '@solidjs/router';
import { createEffect, createSignal, ErrorBoundary, JSX } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as z from 'zod';

/** Various types of errors. */
type Errors = {
  usernameErrors: string[];
  passwordErrors: string[];
  passwordConfirmErrors: string[];
};

export function SignupPage() {
  const storeCtx = useStore();
  const formSubmission = useSubmission(registerUserAction);

  // Make sure store is initalized
  if (storeCtx === undefined) {
    Logger.error('Store must be initalized inside a `<StoreProvider>');
    return;
  }

  const [passwordData, setPasswordData] = createSignal('');

  /** Determines if the login page is in a busy state. */
  const [isBusy, setIsBusy] = createSignal(false);

  /** List of validation errors. */
  const [errMsgs, setErrMsgs] = createStore<Errors>({
    usernameErrors: [],
    passwordErrors: [],
    passwordConfirmErrors: [],
  });

  const [serverErrors, setServerErrors] = createSignal<SpotsError[]>([]);

  /** Determines if the button should be disabled */
  const isBtnDisabled = () =>
    isBusy() ||
    serverErrors().length > 0 ||
    errMsgs.passwordErrors.length > 0 ||
    errMsgs.usernameErrors.length > 0;

  /** Handles form submission results */
  createEffect(async () => {
    formSubmission.result?.match(
      (userId) => {
        Logger.info(`Created user: ${userId}`);
      },
      (err) => {
        setServerErrors((prev) => [...prev, err]);
        const errData = extractError(err);
        Logger.error(
          `ServerError: ${errData.kind}: ${errData.message}: ${errData.info}`
        );
      }
    );
  });

  /** Validates the username using `UsernameSchema`.*/
  async function validateUsername(username: string) {
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
  async function validatePassword(password: string) {
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
          action={registerUserAction.with(storeCtx)}
          method="post"
        >
          <input
            name="username"
            style={SignupPageStyles.inputStyle}
            type="text"
            placeholder="Username"
            oninput={async (e) => {
              setErrMsgs('usernameErrors', []);
              await validateUsername(e.currentTarget.value);
            }}
          />

          <input
            name="password"
            style={SignupPageStyles.inputStyle}
            type="password"
            placeholder="Password"
            oninput={async (e) => {
              setErrMsgs('passwordErrors', []);
              await validatePassword(e.currentTarget.value);
              setPasswordData(e.currentTarget.value);
            }}
          />

          <input
            name="passwordConfirm"
            style={SignupPageStyles.inputStyle}
            type="password"
            placeholder="Confirm Password"
            oninput={async (e) => {
              setErrMsgs('passwordConfirmErrors', []);
              if (passwordData() != e.currentTarget.value) {
                setErrMsgs('passwordConfirmErrors', (prev) => [
                  ...prev,
                  `Passwords must match`,
                ]);
              }
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
      <ErrorMessages errors={serverErrors} setErrors={setServerErrors} />
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
