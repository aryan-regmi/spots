import { JSX } from 'solid-js';

/** A column container. */
export function Column(props: { children?: any; style?: JSX.CSSProperties }) {
  const { children, style } = props;
  const baseStyle: JSX.CSSProperties = {
    display: 'flex',
    'flex-direction': 'column',
    gap: '2em',
  };
  return <div style={{ ...baseStyle, ...style }}>{children}</div>;
}
