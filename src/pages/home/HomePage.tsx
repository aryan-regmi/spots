import '@/App.css';
import '@/pages/home/HomePage.css';
import Loading from '@/components/loading/Loading';
import NavDrawer from '@/components/nav/NavDrawer';
import useAuth from '@/components/auth/useAuth';
import useCloseEndpoint from '@/utils/hooks/network/useCloseEndpoint';
import { Logout } from '@mui/icons-material';
import {
    Avatar,
    Divider,
    IconButton,
    List,
    ListItemButton,
    Stack,
} from '@mui/material';
import { StyledButton } from '@/utils/home/styled';
import { stringAvatar } from '@/utils/stringAvatar';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function HomePage() {
    let { unauthorize, currentUser, isLoading } = useAuth();
    const navigate = useNavigate();
    const closeEndpoint = useCloseEndpoint();

    const [menuIsOpen, setMenuIsOpen] = useState(false);

    if (isLoading || !currentUser) {
        return <Loading />;
    }

    async function logout() {
        await unauthorize();
        await closeEndpoint.mutateAsync();
        navigate('/login', { replace: true });
    }

    async function toggleMenu() {
        setMenuIsOpen(!menuIsOpen);
    }

    async function showProfile() {
        await navigate('/home/profile');
    }

    function menuHeader(currentUser: string) {
        return (
            <StyledButton
                sx={{
                    textTransform: 'none',
                    borderRadius: 0,
                }}
                onClick={showProfile}
            >
                <Stack direction="column">
                    <Stack id="menu-header-inner-row" direction="row">
                        <Avatar {...stringAvatar(currentUser)} />
                        <div id="avatar-text">{currentUser}</div>
                    </Stack>
                    <a id="view-profile-text">View Profile</a>
                </Stack>
            </StyledButton>
        );
    }

    return (
        <Stack direction="column" className="content home-container">
            <IconButton id="avatar" onClick={toggleMenu}>
                <Avatar {...stringAvatar(currentUser)} />
            </IconButton>

            {/* Menu drawer  */}
            {/* FIXME: Extract Menu drawer to separate component */}
            <NavDrawer
                open={menuIsOpen}
                onClose={toggleMenu}
                style={{ backgroundColor: '#1f2f2f' }}
            >
                {/* Menu header */}
                {menuHeader(currentUser)}
                <Divider color="black" style={{ paddingTop: '0.05em' }} />

                {/* Menu items */}
                <List>
                    <ListItemButton onClick={logout}>
                        <Logout />
                        Logout
                    </ListItemButton>
                </List>
            </NavDrawer>

            <Stack direction="row" className="pinned-playlists">
                {/*  TODO: Display playlists here! */}
            </Stack>
        </Stack>
    );
}
