import { JSX } from 'solid-js';

type LoadingProps = {
  size?: 'small' | 'medium' | 'large';
  message?: string;
};

/** A loading screen. */
export function Loading(props: LoadingProps) {
  const sizeMap = {
    small: '2rem',
    medium: '4rem',
    large: '6rem',
  };

  const size = sizeMap[props.size || 'medium'];

  const pulseStyle: JSX.CSSProperties = {
    width: size,
    height: size,
    'background-color': 'rgba(50, 100, 50, 0.5)',
    'border-radius': '50%',
    animation: 'pulse 2s ease-in-out infinite',
  };

  const containerStyle: JSX.CSSProperties = {
    display: 'flex',
    'flex-direction': 'column',
    'align-items': 'center',
    'justify-content': 'center',
    gap: '1rem',
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.5; }
        }
      `}</style>

      <div style={containerStyle}>
        <div style={pulseStyle}></div>
        {props.message && <p>{props.message}</p>}
      </div>
    </>
  );
}
