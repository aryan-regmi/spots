import '@/App.css';
import '@/pages/home/HomePage.css';
import Loading from '@/components/loading/Loading';
import useAuth from '@/components/auth/useAuth';
import { useNavigate } from 'react-router-dom';
import {
    Avatar,
    Button,
    Divider,
    IconButton,
    List,
    ListItemButton,
    Stack,
} from '@mui/material';
import NavDrawer from '@/components/nav/NavDrawer';
import useCloseEndpoint from '@/utils/hooks/network/useCloseEndpoint';
import { Logout } from '@mui/icons-material';
import { stringAvatar } from '@/utils/stringAvatar';
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

    /* FIXME: Move styles to HomePage.css */
    function menuHeader(currentUser: string) {
        return (
            <Button
                style={{
                    backgroundColor: '#1f1f1f',
                    paddingTop: '1em',
                    paddingLeft: '1.5em',
                    marginBottom: 0,
                    paddingBottom: 0,
                    cursor: 'pointer',
                    userSelect: 'none',
                    justifyContent: 'left',
                }}
                sx={{
                    textTransform: 'none',
                    borderRadius: 0,
                }}
                onClick={showProfile}
            >
                <Stack direction="column" className="menu-header">
                    <Stack
                        direction="row"
                        style={{ justifyContent: 'left' }}
                        spacing="0.1em"
                    >
                        <Avatar {...stringAvatar(currentUser)} />
                        <div
                            id="avatar-text"
                            style={{
                                color: 'white',
                                paddingLeft: '0.25em',
                                fontSize: '2em',
                            }}
                        >
                            {currentUser}
                        </div>
                    </Stack>
                    <a
                        style={{
                            fontSize: '0.8em',
                            paddingTop: 0,
                            paddingBottom: 0,
                            paddingLeft: '1.5em',
                            marginBottom: 0,
                            marginTop: 0,
                            color: 'gray',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                        }}
                    >
                        View Profile
                    </a>
                </Stack>
            </Button>
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
