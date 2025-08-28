import '../../App.css';
import { CircularProgress } from '@mui/material';

export default function Loading() {
    return (
        <div
            className="container"
            style={{
                display: 'flex', // 🧠 ensure it's a flexbox
                flexDirection: 'column',
                alignItems: 'center', // horizontal center
                justifyContent: 'center', // vertical center
                textAlign: 'center',
                width: '100vw',
                height: '90vh',
            }}
        >
            <CircularProgress size="5em"></CircularProgress>
        </div>
    );
}
