import { createEffect, JSX } from 'solid-js';
import { A, createAsync, useNavigate, useSubmission } from '@solidjs/router';
import { ErrorMessages } from '@/components/ErrorMessages';
import { Logger } from '@/utils/logger';
import { getAuthUserIdQuery, loginUserAction } from '@/api/auth';

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
    'backdrop-filter': 'blur(20px)',
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

/** The login page. */
export function LoginPage() {
  const navigate = useNavigate();
  const getAuthUserId = createAsync(() => getAuthUserIdQuery());
  const formSubmission = useSubmission(loginUserAction);

  /** Redirects to the dashboard if already authenticated. */
  createEffect(async () => {
    const authToken = await cookieStore.get('auth-token');
    if (authToken) {
      Logger.info(`User already authenticated: redirecting to dashboard`);

      // Get auth user id
      const authUserId = getAuthUserId()?.match(
        (id) => id,
        (err) => {
          Logger.error(`Unable to get auth user ID: ${err}`);
          throw err;
        }
      );

      // Redirect to dashboard
      if (authUserId) {
        navigate(`/user/${authUserId}/dashboard`, { replace: true });
      }
    }
  });

  return (
    <>
      <div class="col" style={LoginPageStyles.containerStyle}>
        {/* Header */}
        <div style={LoginPageStyles.headerStyle}>
          <h1>Spots</h1>
        </div>

        {/* Login form */}
        <form
          class="col"
          style={LoginPageStyles.formStyle}
          action={loginUserAction}
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
      <ErrorMessages errors={[]} />
    </>
  );
}
