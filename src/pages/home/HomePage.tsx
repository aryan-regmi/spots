import '@/App.css';
import '@/pages/home/HomePage.css';
import Loading from '@/components/loading/Loading';
import NavDrawer from '@/components/nav/NavDrawer';
import {
    Avatar,
    BottomNavigation,
    BottomNavigationAction,
    Divider,
    IconButton,
    List,
    ListItemButton,
    Stack,
} from '@mui/material';
import { Logout, Home, Search, List as ListIcon } from '@mui/icons-material';
import { StyledButton } from '@/utils/home/styled';
import { authContextActionAtom, authContextAtom } from '@/utils/auth/atoms';
import { closeEndpointAtom } from '@/utils/network/atoms';
import { stringAvatar } from '@/utils/stringAvatar';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { NavState } from '@/pages/home/NavState';

const menuIsOpenAtom = atom(false);
const navAtom = atom(NavState.Home);

export default function HomePage() {
    const navigate = useNavigate();
    const { authUser, isLoading } = useAtomValue(authContextAtom);
    const { unauthorize } = useAtomValue(authContextActionAtom);
    const closeEndpoint = useAtomValue(closeEndpointAtom);

    /* State */
    const [menuIsOpen, setMenuIsOpen] = useAtom(menuIsOpenAtom);
    const [nav, setNav] = useAtom(navAtom);

    if (isLoading || !authUser) {
        return <Loading />;
    }

    async function logout() {
        toggleMenu();
        await unauthorize();
        await closeEndpoint.mutateAsync();
        navigate('/login', { replace: true });
    }

    async function toggleMenu() {
        setMenuIsOpen(!menuIsOpen);
    }

    async function showProfile() {
        toggleMenu();
        await navigate('/home/profile');
    }

    function navDrawer(currentUser: string) {
        return (
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
        );
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

    function bottomNav() {
        return (
            <BottomNavigation
                showLabels
                value={nav}
                onChange={(_, newNav) => setNav(newNav)}
                style={{
                    backgroundColor: '#54414E',
                    borderRadius: '1em',
                    opacity: 0.9,
                }}
            >
                <BottomNavigationAction
                    label="Home"
                    icon={<Home />}
                    style={{ color: 'white' }}
                />
                <BottomNavigationAction
                    label="Search"
                    icon={<Search />}
                    style={{ color: 'white' }}
                />
                <BottomNavigationAction
                    label="Playlists"
                    icon={<ListIcon />}
                    style={{ color: 'white' }}
                />
            </BottomNavigation>
        );
    }

    function displayNavigatedPage(nav: NavState) {
        switch (nav) {
            case NavState.Home:
                return <div>Home</div>;
            case NavState.Search:
                return <div>Search</div>;
            case NavState.Playlists:
                return <div>Playlists</div>;
        }
    }

    return (
        <Stack
            direction="column"
            className="content home-container"
            style={{ minHeight: '90vh' }}
        >
            <IconButton id="avatar" onClick={toggleMenu}>
                <Avatar {...stringAvatar(authUser)} />
            </IconButton>

            {/* Menu drawer  */}
            {navDrawer(authUser)}

            <Stack
                direction="column"
                className="home-content"
                sx={{ flexGrow: 1 }}
            >
                {displayNavigatedPage(nav)}
                {/*  TODO: Display playlists here! */}
            </Stack>

            {/* Bottom Navigation */}
            {bottomNav()}
        </Stack>
    );
}
