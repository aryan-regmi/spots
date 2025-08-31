import { CircularProgress } from '@mui/material';
import { CSSProperties } from 'react';

const style: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: '95vw',
    height: '90vh',
};

export default function Loading() {
    return (
        <div style={style}>
            <CircularProgress size="5em"></CircularProgress>
            <h3>Loading...</h3>
        </div>
    );
}
