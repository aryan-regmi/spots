import '@/App.css';
import '@/pages/dashboard/DashboardPage.css';
import Loading from '@/components/loading/Loading';
import {
    Avatar,
    BottomNavigation,
    BottomNavigationAction,
    IconButton,
    ListItemButton,
    Stack,
} from '@mui/material';
import { Logout, Home, Search, List as ListIcon } from '@mui/icons-material';
import { authContextActionAtom, authContextAtom } from '@/utils/auth/atoms';
import { closeEndpointAtom } from '@/utils/network/atoms';
import { stringAvatar } from '@/utils/stringAvatar';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { NavState } from '@/pages/dashboard/NavState';
import MenuDrawer, { menuIsOpenAtom } from '@/pages/dashboard/MenuDrawer';

const navAtom = atom(NavState.Home);

export default function DashboardPage() {
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
            <MenuDrawer currentUser={authUser}>
                <ListItemButton onClick={logout}>
                    <Logout />
                    Logout
                </ListItemButton>
            </MenuDrawer>

            <Stack
                direction="column"
                className="home-content"
                sx={{ flexGrow: 1 }}
            >
                {displayNavigatedPage(nav)}
            </Stack>

            {/* Bottom Navigation */}
            {bottomNav()}
        </Stack>
    );
}
