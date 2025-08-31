import { styled } from '@mui/material';

export default function Glassy(component: any) {
    return styled(component)({
        boxSizing: 'border-box',
        background: 'rgba(255, 255, 255, 0.01)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    });
}
