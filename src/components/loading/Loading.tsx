import { CircularProgress, Typography, TypographyProps } from '@mui/material';
import { Component, CSSProperties } from 'react';

const style: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: '95vw',
    height: '90vh',
};

// TODO: Return a skeleton instead (props to pass in sizes and layout)
export default function Loading(props: {
    spinnerSize?: string | number;
    spinnerStyle?: CSSProperties;
    children?: any;
}) {
    const { spinnerSize, spinnerStyle, children } = props;

    return (
        <div style={style}>
            <CircularProgress
                size={spinnerSize}
                style={spinnerStyle}
            ></CircularProgress>
            {children}
        </div>
    );
}
