import { JSX } from 'solid-js';

/** A row container. */
export function Row(props: { children?: any; style?: JSX.CSSProperties }) {
  const { children, style } = props;
  const baseStyle: JSX.CSSProperties = {
    display: 'flex',
    'flex-direction': 'row',
    gap: '2em',
  };
  return <div style={{ ...baseStyle, ...style }}>{children}</div>;
}
