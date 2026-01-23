import useAuth from '@/auth/useAuth';
import { Avatar } from '@/components/Avatar';
import { Column } from '@/components/Column';
import { Row } from '@/components/Row';
import { A, useNavigate } from '@solidjs/router';
import { createSignal, onMount } from 'solid-js';
import { JSX } from 'solid-js/h/jsx-runtime';

/** The user's dashboard page. */
export function DashboardPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  /** Determines if the page is in a loading state. */
  const [loading, setLoading] = createSignal(false);

  /** Redirects to login page if no user is logged in. */
  onMount(() => {
    if (auth.authUser() === null) {
      navigate('/', { replace: true });
    }
  });

  /** Style for the entire page/container div. */
  const dashboardContainerStyle: JSX.CSSProperties = {
    display: 'flex',
    'flex-direction': 'column',
    padding: '0em 2em 2em',
    'margin-top': '-3em',
  };

  /** The `id` attribute for the popover menu. */
  const popoverId = 'popover-menu';

  return (
    <>
      <PopoverMenu
        popoverId={popoverId}
        auth={auth}
        navigate={navigate}
        loading={loading}
        setLoading={setLoading}
      />

      <div style={dashboardContainerStyle}>
        <Avatar
          name={auth.authUser()?.username || ''}
          popoverTargetId={popoverId}
          animate
        />
      </div>
    </>
  );
}

/** The component for the popover menu in the dashboard. */
function PopoverMenu(props: {
  popoverId: string;
  auth: any;
  navigate: any;
  loading: any;
  setLoading: any;
}) {
  /** The background color of the menu header.  */
  const [headerBgColor, setHeaderBgColor] = createSignal('rgba(0, 0, 0, 0.0)');

  /** Logs the user out and redirects to the login page. */
  function logout() {
    props.setLoading(true);
    try {
      props.auth.unauthenticate(props.auth.authUser()?.username!);
      props.navigate('/', { replace: true });
    } catch (error) {
      console.error(error);
    } finally {
      props.setLoading(false);
    }
  }

  /** Style for the popover menu. */
  const style: JSX.CSSProperties = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '50vw',
    height: '100vh',
    padding: 0,
    'margin-left': '0',
    'background-color': 'rgba(0, 0, 0, 0.5)',
    'box-sizing': 'border-box',
    'z-index': 1000,
    'border-radius': '0 1em 1em 0',
    'backdrop-filter': 'blur(50px)',
    'border-width': '0.01em',
    'border-color': 'rgba(30, 30, 30, 0.8)',
  };

  return (
    <>
      <div id={props.popoverId} style={style} popover>
        <Column style={{ padding: '4em 2em 2em 2.4em' }}>
          {/* Menu header */}
          <span
            id="menu-header"
            onMouseEnter={() => {
              setHeaderBgColor('rgba(0, 0, 0, 0.1)');
            }}
            onMouseLeave={() => {
              setHeaderBgColor('rgba(0, 0, 0, 0)');
            }}
            onClick={() => {}}
            style={{
              'background-color': headerBgColor(),
              'border-radius': '1em',
              padding: '2em',
              'padding-bottom': 0,
              'margin-top': '-2em',
              'margin-left': '-2em',
              'margin-right': '-1.5em',
            }}
          >
            <Column
              style={{
                gap: '0',
                cursor: 'pointer',
              }}
            >
              <Row style={{ gap: '0.5em', 'align-items': 'center' }}>
                <Avatar name={props.auth.authUser()?.username || ''} />
                <span style={{ color: 'white' }}>
                  {props.auth.authUser()?.username}
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
            </Column>
          </span>
          <hr
            style={{
              width: '100%',
              'margin-top': '-2em',
              color: 'rgba(30,35,45,0.8)',
            }}
          />

          {/* Menu content/list */}
          <span>
            <A href="/" replace onClick={logout}>
              {props.loading() ? 'Logging out...' : 'Log out'}
            </A>
          </span>
        </Column>
      </div>
    </>
  );
}
