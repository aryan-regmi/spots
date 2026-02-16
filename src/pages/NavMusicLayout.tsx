import { useAuth } from '@/services/auth/provider';
import { createAsync, useNavigate } from '@solidjs/router';
import { Shimmer } from '@shimmer-from-structure/solid';
import { JSX } from 'solid-js';

export function NavMusicLayout(props: { children?: any }) {
  const auth = useAuth();
  const authUserQuery = createAsync(() => auth.getAuthUserQuery());

  return (
    <>
      <Shimmer loading={authUserQuery() === undefined}>
        {props.children}
        <Navbar currentPath="/user/dashboard" />
      </Shimmer>
    </>
  );
}

function Navbar(props: { currentPath?: string }) {
  const navigate = useNavigate();

  //  TODO: Add actual nav icons
  //
  /** The navigation bar content. */
  const navItems = [
    { label: 'Home', path: '/user/dashboard', icon: '🏠' },
    { label: 'Search', path: '/user/search', icon: '🔍' },
    { label: 'Library', path: '/user/library', icon: '📚' },
  ];

  /** Style for the navbar container. */
  const containerStyle: JSX.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    'justify-content': 'space-around',
    'align-items': 'center',
    'background-color': 'rgba(20, 20, 20, 0.95)',
    'border-top': '1px solid rgba(100, 100, 100, 0.2)',
    padding: '0.5rem 0',
    margin: '1rem 4rem',
    'border-radius': '1rem',
    'z-index': 100,
    'backdrop-filter': 'blur(10px)',
  };

  /** Style for button wrapper in the navbar. */
  const buttonWrapperStyle: JSX.CSSProperties = {
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    flex: 1,
    cursor: 'pointer',
  };

  /** Style for the button being wrapped. */
  const navButtonStyle = (isActive: boolean): JSX.CSSProperties => ({
    display: 'flex',
    'flex-direction': 'column',
    'align-items': 'center',
    'justify-content': 'center',
    gap: '0.25rem',
    padding: '0.75rem 1.5rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: isActive ? 'rgba(50, 200, 50, 1)' : 'rgba(150, 150, 150, 1)',
    transition: 'all 0.3s ease',
    'font-size': '1.5rem',
    'border-radius': '0',
    outline: 'none',
    'box-shadow': 'none',
    width: '100%',
  });

  /** Style for the navbar button labels. */
  const labelStyle: JSX.CSSProperties = {
    'font-size': '0.75rem',
    'font-weight': '500',
  };
  return (
    <nav style={containerStyle}>
      {navItems.map((item, index) => (
        <>
          <div
            style={buttonWrapperStyle}
            onMouseEnter={(e) => {
              const button = e.currentTarget.querySelector('button');
              if (button) {
                button.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              const button = e.currentTarget.querySelector('button');
              if (button) {
                button.style.transform = 'scale(1)';
              }
            }}
          >
            <button
              style={navButtonStyle(props.currentPath === item.path)}
              onClick={(e) => {
                e.stopPropagation();
                navigate(item.path);
              }}
            >
              <span>{item.icon}</span>
              <span style={labelStyle}>{item.label}</span>
            </button>
          </div>
          {index < navItems.length - 1 && (
            <div
              style={{
                width: '1px',
                height: '2rem',
                'background-color': 'rgba(100, 100, 100, 0.2)',
              }}
            ></div>
          )}
        </>
      ))}
    </nav>
  );
}
