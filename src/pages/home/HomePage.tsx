import '../../App.css';
import './HomePage.css';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../components/auth/useAuth';
import { closeEndpoint } from '../../api/network';
import Loading from '../../components/loading/Loading';
import { Avatar, Button, Divider, IconButton, Stack } from '@mui/material';
import { stringAvatar } from '../../common/stringAvatar';
import { useState } from 'react';
import NavDrawer from '../../components/nav/NavDrawer';

export default function HomePage() {
    const { unauthorize, currentUser, isLoading } = useAuth();
    const navigate = useNavigate();

    const [menuIsOpen, setMenuIsOpen] = useState(false);

    if (isLoading || !currentUser) {
        return <Loading />;
    }

    async function logout() {
        await unauthorize();
        await closeEndpoint();
        navigate('/login', { replace: true });
    }

    async function toggleMenu() {
        setMenuIsOpen(!menuIsOpen);
    }

    async function showProfile() {
        /* FIXME: Implement
         * 
        /* await navigate('/home/profile'); */
    }

    return (
        <Stack direction="column" className="content home-container">
            {/* Menu drawer  */}
            {/* FIXME: Extract Menu drawer to separate component */}
            <IconButton id="avatar" onClick={toggleMenu}>
                <Avatar {...stringAvatar(currentUser)} />
            </IconButton>
            <NavDrawer
                open={menuIsOpen}
                onClose={toggleMenu}
                style={{ backgroundColor: '#2f2f2f' }}
            >
                {/* Menu header */}
                <Stack
                    direction="column"
                    className="menu-header"
                    style={{
                        backgroundColor: '#1f1f1f',
                        paddingTop: '1em',
                        paddingLeft: '1em',
                        cursor: 'pointer',
                        userSelect: 'none',
                    }}
                    onClick={showProfile}
                >
                    <Stack
                        direction="row"
                        style={{ justifyContent: 'left' }}
                        spacing="1em"
                    >
                        <IconButton>
                            <Avatar {...stringAvatar(currentUser)} />
                            <div
                                id="avatar-text"
                                style={{
                                    color: 'white',
                                    marginBottom: 0,
                                    paddingLeft: '0.5em',
                                }}
                            >
                                {currentUser}
                            </div>
                        </IconButton>
                    </Stack>
                    <a
                        style={{
                            fontSize: '0.8em',
                            paddingTop: 0,
                            paddingBottom: '0.2em',
                            paddingLeft: '4em',
                            marginBottom: 0,
                            marginTop: 0,
                            color: 'gray',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            /* -webkit-user-select: "none" */
                        }}
                    >
                        View Profile
                    </a>
                </Stack>
                <Divider color="black" style={{ paddingTop: '0.05em' }} />
            </NavDrawer>

            <Stack direction="row" className="pinned-playlists">
                {/*  TODO: Display playlists here! */}
            </Stack>

            {/* <Button onClick={logout}>Log Out</Button> */}
        </Stack>
    );
}
