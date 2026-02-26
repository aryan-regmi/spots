import { A, useSubmission } from '@solidjs/router';
import { ErrorMessages } from '@/components/ErrorMessages';
import { Logger } from '@/utils/logger';
import { SpotsError } from '@/utils/errors';
import { createEffect, createSignal, JSX } from 'solid-js';
import { createStore } from 'solid-js/store';
import { registerUserAction } from '@/api/auth';
import { useStore } from '@/utils/tauriStore';
import { ApiErrorAdapter } from '@/api/utils';
import { PasswordSchema, UsernameSchema } from '@/utils/zodSchemas';
import { ValidationErrors } from '@/components/ValidationErrors';

/** Various types of errors. */
type Errors = {
  usernameErrors: string[];
  passwordErrors: string[];
  passwordConfirmErrors: string[];
};

export function SignupPage() {
  const storeCtx = useStore();
  const formSubmission = useSubmission(registerUserAction);
  const styles = signupPageStyles();

  /** Stores the password input. */
  const [passwordInput, setPasswordInput] = createSignal<string | undefined>();

  /** Stores the confirm password input. */
  const [passwordConfirmInput, setPasswordConfirmInput] = createSignal<
    string | undefined
  >();

  /** Validation error messages. */
  const [errMsgs, setErrMsgs] = createStore<Errors>({
    usernameErrors: [],
    passwordErrors: [],
    passwordConfirmErrors: [],
  });

  /** Server error messages. */
  const [serverErrors, setServerErrors] = createSignal<SpotsError[]>([]);

  /** Determines if the button should be disabled */
  const isBtnDisabled = () =>
    serverErrors().length > 0 ||
    formSubmission.pending ||
    errMsgs.passwordErrors.length > 0 ||
    errMsgs.usernameErrors.length > 0;

  /** Handles form submission results */
  createEffect(async () => {
    formSubmission.result?.match(
      (userId) => {
        Logger.info('Created user', userId);
      },
      (error) => {
        let err: SpotsError;
        if ('_tag' in error) {
          err = error;
        } else {
          err = ApiErrorAdapter.into(error);
        }
        setServerErrors((prev) => [...prev, err]);
        Logger.error(`ServerError: ${err.kind}: ${err.message}`, err.info);
      }
    );
  });

  /** Makes sure password confirm data matches password. */
  createEffect(async () => {
    if (passwordInput() !== passwordConfirmInput()) {
      setErrMsgs('passwordConfirmErrors', (prev) => [
        ...prev,
        `Passwords must match`,
      ]);
    } else {
      setErrMsgs('passwordConfirmErrors', []);
    }
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

  /** Handles username input. */
  const usernameOnInput: JSX.EventHandler<HTMLInputElement, Event> = async (
    e
  ) => {
    setServerErrors([]);
    setErrMsgs('usernameErrors', []);
    await validateUsername(e.currentTarget.value);
  };

  /** Handles password input. */
  const passwordOnInput: JSX.EventHandler<HTMLInputElement, Event> = async (
    e
  ) => {
    setServerErrors([]);
    setPasswordInput(e.currentTarget.value);
    setErrMsgs('passwordErrors', []);
    await validatePassword(e.currentTarget.value);
  };

  return (
    <>
      {/* Main contents */}
      <div class="col" style={styles.containerStyle}>
        {/* Header */}
        <div style={styles.headerStyle}>
          <h1>Spots</h1>
        </div>

        {/* Signup form */}
        <form
          class="col"
          style={styles.formStyle}
          action={registerUserAction.with(storeCtx)}
          method="post"
        >
          <input
            name="username"
            style={styles.inputStyle}
            type="text"
            placeholder="Username"
            onInput={usernameOnInput}
          />
          <ValidationErrors errors={errMsgs.usernameErrors} />

          <input
            name="password"
            style={styles.inputStyle}
            type="password"
            placeholder="Password"
            onInput={passwordOnInput}
          />
          <ValidationErrors errors={errMsgs.passwordErrors} />

          <input
            name="passwordConfirm"
            style={styles.inputStyle}
            type="password"
            placeholder="Confirm Password"
            onInput={async (e) =>
              setPasswordConfirmInput(e.currentTarget.value)
            }
          />
          <ValidationErrors errors={errMsgs.passwordConfirmErrors} />

          <button
            type="submit"
            disabled={isBtnDisabled()}
            style={
              isBtnDisabled()
                ? styles.submitBtnDisabledStyle
                : styles.submitBtnStyle
            }
          >
            {formSubmission.pending ? 'Creating login...' : 'Sign Up'}
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
    </>
  );
}

/** All styles for the signup page.  */
function signupPageStyles() {
  const containerStyle: JSX.CSSProperties = {
    padding: '2rem',
    'align-items': 'center',
    'align-content': 'center',
    gap: '7em',
  };

  const headerStyle: JSX.CSSProperties = {
    'background-color': 'rgba(20, 50, 100, 0.8)',
    'border-radius': '1rem',
    width: '95%',
    'margin-top': '10rem',
  };

  const formStyle: JSX.CSSProperties = {
    gap: '2rem',
    'font-size': '1.2rem',
    'margin-bottom': '-3rem',
  };

  const inputStyle: JSX.CSSProperties = {
    width: '20rem',
    'background-color': 'black',
    color: 'rgba(200, 200, 255, 0.9)',
    'border-radius': '2rem',
    'box-shadow': '0 1px 1px',
  };

  const submitBtnStyle: JSX.CSSProperties = {
    'background-color': 'rgba(50, 50, 150, 1)',
    'margin-top': '3rem',
    'box-shadow': '0 1px 1px black',
    'border-radius': '1rem',
  };

  const submitBtnDisabledStyle: JSX.CSSProperties = {
    ...submitBtnStyle,
    'background-color': 'rgba(50, 50, 55, 1)',
    cursor: 'not-allowed',
  };

  return {
    containerStyle,
    headerStyle,
    formStyle,
    inputStyle,
    submitBtnStyle,
    submitBtnDisabledStyle,
  };
}
