import { A, useNavigate, useSubmission } from '@solidjs/router';
import { loginUserAction } from '@/api/auth';
import { ErrorMessages } from '@/components/ErrorMessages';
import { Logger } from '@/utils/logger';
import { createEffect, createSignal, JSX } from 'solid-js';
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

  // Make sure store is initalized
  if (storeCtx === undefined) {
    Logger.error('Store must be initalized inside a `<StoreProvider>');
    return;
  }
  const [authToken] = getAuthTokenResource(storeCtx);
  const [authUserId] = getAuthUserIdResource(storeCtx);

  /** Errors from the server. */
  const [serverErrors, setServerErrors] = createSignal<SpotsError[]>([]);

  /** Redirects to the dashboard if already authenticated. */
  createEffect(async () => {
    if (authToken()) {
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

  return (
    <Shimmer loading={storeCtx.store() === undefined}>
      <div class="col" style={LoginPageStyles.containerStyle}>
        {/* Header */}
        <div style={LoginPageStyles.headerStyle}>
          <h1>Spots</h1>
        </div>

        {/* Login form */}
        <form
          class="col"
          style={LoginPageStyles.formStyle}
          action={loginUserAction.with(storeCtx)}
          method="post"
        >
          <input
            name="username"
            style={LoginPageStyles.inputStyle}
            type="text"
            placeholder="Username"
          />
          <input
            name="password"
            style={LoginPageStyles.inputStyle}
            type="password"
            placeholder="Password"
          />
          <button
            type="submit"
            disabled={formSubmission.pending}
            style={
              formSubmission.pending
                ? LoginPageStyles.submitBtnDisabledStyle
                : LoginPageStyles.submitBtnStyle
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

/** Type of styles in the login page. */
type styles = {
  /** Style for the main container. */
  containerStyle: JSX.CSSProperties;

  /** Style for the header. */
  headerStyle: JSX.CSSProperties;

  /** Style for the form. */
  formStyle: JSX.CSSProperties;

  /** Style for the form inputs. */
  inputStyle: JSX.CSSProperties;

  /** Style for the login button. */
  submitBtnStyle: JSX.CSSProperties;

  /** Style for the disabled login button. */
  submitBtnDisabledStyle: JSX.CSSProperties;
};

/** All styles for the login page.  */
const LoginPageStyles: styles = {
  containerStyle: {
    padding: '2rem',
    'align-items': 'center',
    'align-content': 'center',
    gap: '7em',
    // 'backdrop-filter': 'blur(20px)',
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
