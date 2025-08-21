import './Card.css';
import { CSSProperties } from 'react';

export function Card(props: {
    children: any;
    onClick?: () => void;
    backgroundImage?: string;
    className?: string;
    style?: CSSProperties;
}) {
    let { children, onClick, backgroundImage, className, style } = props;

    // Sets up the background if an image is provided
    const backgroundStyle: CSSProperties = backgroundImage
        ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
          }
        : {};

    return (
        <div
            className={`card ${className ?? ''}`}
            style={{ ...backgroundStyle, ...style }}
            onClick={(_) => onClick && onClick()}
        >
            <div className="card-body">{children}</div>
        </div>
    );
}
