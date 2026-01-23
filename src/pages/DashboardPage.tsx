import useAuth from '@/auth/useAuth';
import { Avatar } from '@/components/Avatar';
import { A, useNavigate } from '@solidjs/router';
import { createSignal, onMount } from 'solid-js';
import { JSX } from 'solid-js/h/jsx-runtime';

export function DashboardPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  /** Determines if the page is in a loading state. */
  const [loading, setLoading] = createSignal(false);

  /** Redirects to login page if no user is logged in. */
  onMount(() => {
    if (auth.authUser() === null) {
      navigate('/', { replace: true });
    }
  });

  /** Logs the user out and redirects to the login page. */
  function logout() {
    setLoading(true);
    try {
      auth.unauthenticate(auth.authUser()?.username!);
      navigate('/', { replace: true });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  /** Style for the entire page/container div. */
  const ContainerStyle: JSX.CSSProperties = {
    display: 'flex',
    'flex-direction': 'column',
    padding: '0em 2em 2em',
    'margin-top': '-3em',
  };

  /** Style for the popover menu. */
  const PopoverStyle: JSX.CSSProperties = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '50vw',
    height: '100vh',
    padding: 0,
    'margin-left': '0',
    background: 'inherit',
    'background-color': 'rgba(0, 0, 0, 0.5)',
    'box-sizing': 'border-box',
    'z-index': 1000,
    'border-radius': '0 1em 1em 0',
    'backdrop-filter': 'blur(10px)',
  };

  return (
    <>
      {/* <div id="popover-menu" style={PopoverStyle} popover> */}
      <div id="popover-menu" style={PopoverStyle}>
        <Column style={{ padding: '4em 2em 2em 2.4em' }}>
          {/* TODO: Add styles for when this column is hovered */}
          <span>
            <Column
              style={{
                gap: '0',
              }}
            >
              <Row style={{ gap: '0.5em', 'align-items': 'center' }}>
                <Avatar name={auth.authUser()?.username || ''} />
                <span style={{ color: 'white' }}>
                  {auth.authUser()?.username}
                </span>
              </Row>

              <span
                style={{
                  'font-size': '0.8em',
                  color: 'gray',
                  margin: 0,
                  'align-self': 'flex-start',
                  'padding-left': '4.25em',
                  'margin-top': '-1em',
                }}
              >
                View Profile
              </span>

              <hr
                style={{
                  width: '100%',
                  'margin-top': '-0.1em',
                  color: 'rgba(30,35,45,0.8)',
                }}
              />
            </Column>
          </span>

          <A href="/" replace onClick={logout}>
            {loading() ? 'Logging out...' : 'Log out'}
          </A>
        </Column>
      </div>

      <div style={ContainerStyle}>
        <Avatar
          name={auth.authUser()?.username || ''}
          popoverTargetId="popover-menu"
        />
      </div>
    </>
  );
}

function Column(props: { children?: any; style?: JSX.CSSProperties }) {
  const { children, style } = props;
  const baseStyle: JSX.CSSProperties = {
    display: 'flex',
    'flex-direction': 'column',
    gap: '2em',
  };
  return <div style={{ ...baseStyle, ...style }}>{children}</div>;
}

function Row(props: { children?: any; style?: JSX.CSSProperties }) {
  const { children, style } = props;
  const baseStyle: JSX.CSSProperties = {
    display: 'flex',
    'flex-direction': 'row',
    gap: '2em',
  };
  return <div style={{ ...baseStyle, ...style }}>{children}</div>;
}
