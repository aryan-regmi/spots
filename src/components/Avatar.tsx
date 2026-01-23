import { createSignal } from 'solid-js';
import { JSX } from 'solid-js/h/jsx-runtime';

/** Props for the [Avatar] component. */
type AvatarProps = {
  name: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  popoverTargetId?: string;
  animate?: boolean;
};

/** An avatar component. */
export function Avatar(props: AvatarProps) {
  /** Represents the size classes for the avatar. */
  const sizeClasses = {
    small: {
      width: '32px',
      height: '32px',
      fontSize: '14px',
    },
    medium: {
      width: '48px',
      height: '48px',
      fontSize: '18px',
    },
    large: {
      width: '64px',
      height: '64px',
      fontSize: '24px',
    },
  };

  /** The size of the avatar. */
  const size = props.size || 'medium';

  /** The first letter of the string passed to the avatar. */
  const firstLetter = props.name.charAt(0).toUpperCase();

  /** The background color of the avatar (determined by the 1st letter). */
  const backgroundColor = `hsl(${Math.abs(props.name.charCodeAt(0)) % 360}, 70%, 50%)`;

  /** Tranform for the avatar; changes when hovered. */
  const [transform, setTransform] = createSignal('scale(1)');

  /** Box shadow for the avatar; changes when hovered. */
  const [boxShadow, setBoxShadow] = createSignal('none');

  /** Style for the avatar container. */
  const AvatarContainerStyle: () => JSX.CSSProperties = () => {
    const baseStyle: JSX.CSSProperties = {
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'border-radius': '50%',
      cursor: 'pointer',
      color: 'white',
      'font-weight': 'bold',
      'user-select': 'none',
      'background-color': backgroundColor,
      ...sizeClasses[size],
      border: 'none',
      outline: 'none',
      padding: '0',
    };

    if (props.animate) {
      return {
        ...baseStyle,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: transform(),
        'box-shadow': boxShadow(),
      };
    } else {
      return baseStyle;
    }
  };

  /** Style for the avatar itself. */
  const AvatarStyle: JSX.CSSProperties = {
    'font-size': sizeClasses[size].fontSize || '18px',
  };

  /** Handles when avatar is hovered. */
  function handleMouseEnter() {
    if (props.animate) {
      setTransform('scale(1.05)');
      setBoxShadow('0 4px 12px rgba(0, 0, 0, 0.15)');
    }
  }

  /** Handles when avatar is no longer hovered. */
  function handleMouseLeave() {
    if (props.animate) {
      setTransform('scale(1)');
      setBoxShadow('none');
    }
  }

  /** Handles avatar click by calling the given `onClick` function. */
  function handleOnClick() {
    if (props.onClick) {
      props.onClick();
    }
  }

  return (
    <button
      style={AvatarContainerStyle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleOnClick}
      role="img"
      aria-label={`Avatar for ${props.name}`}
      popovertarget={props.popoverTargetId}
    >
      <span style={AvatarStyle}>{firstLetter}</span>
    </button>
  );
}
