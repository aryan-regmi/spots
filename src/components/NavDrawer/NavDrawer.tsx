import './NavDrawer.css';
import {
    AppBar,
    Box,
    Divider,
    Drawer,
    Icon,
    IconButton,
    Toolbar,
    Typography,
} from '@mui/material';
import { Menu, AccountCircle } from '@mui/icons-material';

import { useState, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

export function NavDrawer(props: {
    title: string;
    children?: any;
    style?: CSSProperties;
}) {
    const navigate = useNavigate();

    const { title, children, style } = props;
    const [open, setOpen] = useState(false);

    const defaultStyle: CSSProperties = {
        backgroundColor: '#2f2f2f',
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
        backgroundColor: defaultStyle.backgroundColor,
        width: '80%',
        borderTopRightRadius: '1em',
        borderBottomRightRadius: '1em',
        opacity: 0.98,
    };

    function toggleDrawer() {
        setOpen(!open);
    }

    async function redirectToProfile() {
        console.log('Clicked!');
        await navigate('/home/profile');
    }

    // FIXME: Move styles to css file!
    return (
        <div>
            {appBar}
            <Drawer
                open={open}
                onClose={toggleDrawer}
                slotProps={{
                    paper: {
                        sx: drawerSlotStyle,
                    },
                }}
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
                    {children}
                </div>
            </Drawer>
        </div>
    );
}
