import { createEffect, createSignal } from 'solid-js';
import { JSX } from 'solid-js/h/jsx-runtime';

/** Props for the [Avatar] component. */
type AvatarProps = {
  name: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
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

  /** Determines if the avatar is currently being hovered. */
  const [isHovered, setIsHovered] = createSignal(false);

  /** Tranform for the avatar; changes when hovered. */
  const [transform, setTransform] = createSignal('scale(1)');

  /** Box shadow for the avatar; changes when hovered. */
  const [boxShadow, setBoxShadow] = createSignal('none');

  /** Style for the avatar container. */
  const AvatarContainerStyle: () => JSX.CSSProperties = () => {
    return {
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'border-radius': '50%',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      color: 'white',
      'font-weight': 'bold',
      'user-select': 'none',
      'background-color': backgroundColor,
      ...sizeClasses[size],
      transform: transform(),
      'box-shadow': boxShadow(),
    };
  };

  /** Style for the avatar itself. */
  const AvatarStyle: JSX.CSSProperties = {
    'font-size': sizeClasses[size].fontSize || '18px',
  };

  /** Handles when avatar is hovered. */
  function handleMouseEnter() {
    setIsHovered(true);
    setTransform('scale(1.05)');
    setBoxShadow('0 4px 12px rgba(0, 0, 0, 0.15)');
  }

  /** Handles when avatar is no longer hovered. */
  function handleMouseLeave() {
    setIsHovered(false);
    setTransform('scale(1)');
    setBoxShadow('none');
  }

  /** Handles avatar click by calling the given `onClick` function. */
  function handleOnClick() {
    if (props.onClick) {
      props.onClick();
    }
  }

  return (
    <div
      style={AvatarContainerStyle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleOnClick}
      role="img"
      aria-label={`Avatar for ${props.name}`}
    >
      <span style={AvatarStyle}>{firstLetter}</span>
    </div>
  );
}
