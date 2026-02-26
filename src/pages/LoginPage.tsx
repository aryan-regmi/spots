import { A, useNavigate, useSubmission } from '@solidjs/router';
import { loginUserAction } from '@/api/auth';
import { ErrorMessages } from '@/components/ErrorMessages';
import { Logger } from '@/utils/logger';
import { createEffect, createSignal, JSX, onMount } from 'solid-js';
import {
  getAuthTokenResource,
  getAuthUserIdResource,
  useStore,
} from '@/utils/tauriStore';
import { Shimmer } from '@shimmer-from-structure/solid';
import { extractError, SpotsError } from '@/utils/errors';

/** The login page. */
export function LoginPage() {
  const navigate = useNavigate();
  const storeCtx = useStore();
  const formSubmission = useSubmission(loginUserAction);
  const [authToken] = getAuthTokenResource(storeCtx);
  const [authUserId] = getAuthUserIdResource(storeCtx);

  const styles = loginPageStyles();

  /** Errors from the server. */
  const [serverErrors, setServerErrors] = createSignal<SpotsError[]>([]);

  /** Determines if the button should be disabled */
  const isBtnDisabled = () =>
    serverErrors().length > 0 || formSubmission.pending;

  /** Redirects to the dashboard if already authenticated. */
  createEffect(() => {
    if (
      storeCtx.store() === undefined || // Wait for store to be initialized
      authToken.loading || // Wait for auth token to resolve
      authUserId.loading // Wait for auth user ID to resolve
    ) {
      return;
    }

    if (authToken() !== undefined) {
      Logger.info(`User already authenticated: redirecting to dashboard`);

      // Redirect to dashboard
      if (authUserId()) {
        navigate(`/user/${authUserId()}/dashboard`, { replace: true });
      }
    }
  });

  /** Handles form submission results */
  createEffect(async () => {
    formSubmission.result?.match(
      (userId) => {
        Logger.info(`Logged in user: ${userId}`);
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

  // TODO: Add client-side validation (use Zod)
  //  - Check for empty inputs?

  return (
    <Shimmer
      loading={
        storeCtx === undefined ||
        storeCtx.store() === undefined ||
        authToken.loading ||
        authUserId.loading
      }
    >
      <div class="col" style={styles.containerStyle}>
        {/* Header */}
        <div style={styles.headerStyle}>
          <h1>Spots</h1>
        </div>

        {/* Login form */}
        <form
          class="col"
          style={styles.formStyle}
          action={loginUserAction.with(storeCtx)}
          method="post"
        >
          <input
            name="username"
            style={styles.inputStyle}
            type="text"
            placeholder="Username"
          />
          <input
            name="password"
            style={styles.inputStyle}
            type="password"
            placeholder="Password"
          />
          <button
            type="submit"
            disabled={isBtnDisabled()}
            style={
              isBtnDisabled()
                ? styles.submitBtnDisabledStyle
                : styles.submitBtnStyle
            }
          >
            {formSubmission.pending ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Signup link */}
        <div
          style={{
            'font-size': '0.8rem',
          }}
        >
          New user? <A href="/signup">Sign Up</A>
        </div>
      </div>

      {/* Error Messages */}
      <ErrorMessages errors={serverErrors} setErrors={setServerErrors} />
    </Shimmer>
  );
}

/** All styles for the login page.  */
function loginPageStyles() {
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
    'background-color': 'rgba(50, 50, 55, 1)',
    cursor: 'not-allowed',
    ...submitBtnStyle,
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
