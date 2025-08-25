import './NavDrawer.css';
import {
    AppBar,
    Box,
    Divider,
    Drawer,
    Icon,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from '@mui/material';
import {
    Menu,
    AccountCircle,
    BackHand,
    BarcodeReader,
} from '@mui/icons-material';

import { useState, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

export function NavDrawer(props: { title: string; style?: CSSProperties }) {
    const navigate = useNavigate();

    const { title, style } = props;
    const [open, setOpen] = useState(false);

    const defaultStyle: CSSProperties = {
        backgroundColor: '#1f2f2f',
    };

    const appBar = (
        <AppBar style={{ backgroundColor: 'peru' }}>
            <Toolbar>
                <IconButton onClick={toggleDrawer}>
                    <Menu></Menu>
                </IconButton>
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        paddingRight: '2em',
                    }}
                >
                    <Typography variant="h6" component="div">
                        Spots
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    );

    const drawerSlotStyle = {
        paper: {
            sx: {
                backgroundColor: defaultStyle.backgroundColor,
                width: '80%',
                borderTopRightRadius: '1em',
                borderBottomRightRadius: '1em',
                /* opacity: 0.98, */
            },
        },
    };

    const menuItems: MenuItem[] = [
        {
            label: 'Menu 1',
            icon: <BackHand />,
            onClick: () => console.log('Menu 1'),
        },
        {
            label: 'Menu 2',
            icon: <BarcodeReader />,
            onClick: () => console.log('Menu 2'),
        },
    ];

    function toggleDrawer() {
        setOpen(!open);
    }

    async function redirectToProfile() {
        await navigate('/home/profile');
    }

    return (
        <div>
            {appBar}
            <Drawer
                open={open}
                onClose={toggleDrawer}
                slotProps={drawerSlotStyle}
            >
                <div
                    className="drawer-main"
                    style={{ ...defaultStyle, ...style }}
                >
                    <div className="drawer-header" onClick={redirectToProfile}>
                        <div className="row drawer-header-content">
                            <Icon fontSize="large">
                                <AccountCircle fontSize="large"></AccountCircle>
                            </Icon>
                            {title}
                        </div>
                        <div id="view-profile-button">
                            <a style={{ color: 'gray' }}>View Profile</a>
                        </div>
                    </div>

                    <Divider color="white" style={{ marginTop: 0 }} />

                    <List className="menu-items">
                        {menuItems.map((item) => (
                            <div key={item.label} className="menu-item-btn">
                                <ListItemButton
                                    className="row"
                                    onClick={item.onClick}
                                >
                                    {item.icon}
                                    {item.label}
                                </ListItemButton>
                            </div>
                        ))}
                    </List>
                </div>
            </Drawer>
        </div>
    );
}

type MenuItem = {
    label: string;
    icon: any;
    onClick?: () => void;
};
