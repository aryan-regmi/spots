import { Drawer } from '@mui/material';
import { CSSProperties } from 'react';

export default function NavDrawer(props: {
    open: boolean;
    onClose?: () => void;
    children: any;
    style?: CSSProperties;
}) {
    const { open, onClose, children, style } = props;

    const drawerSlotStyle = {
        paper: {
            sx: {
                backgroundColor: '#1f2f2f',
                width: '80%',
                borderTopRightRadius: '1em',
                borderBottomRightRadius: '1em',
                ...style,
            },
        },
    };

    return (
        <Drawer open={open} onClose={onClose} slotProps={drawerSlotStyle}>
            {children}
        </Drawer>
    );
}
