import '@/App.css';
import Loading from '@/components/loading/Loading';
import {
    Avatar,
    IconButton,
    ListItemButton,
    Stack,
    styled,
} from '@mui/material';
import { Logout } from '@mui/icons-material';
import { authContextActionAtom, authContextAtom } from '@/utils/auth/atoms';
import { closeEndpointAtom } from '@/utils/network/atoms';
import { stringAvatar } from '@/utils/stringAvatar';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { NavState } from '@/pages/dashboard/NavState';
import MenuDrawer, { menuIsOpenAtom } from '@/pages/dashboard/MenuDrawer';
import BottomNav from './BottomNav';

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
        <DashboardContainer direction="column">
            <IconButton
                style={{
                    justifyContent: 'left',
                    width: 'fit-content',
                }}
                onClick={toggleMenu}
            >
                <Avatar {...stringAvatar(authUser)} />
            </IconButton>

            {/* Menu drawer  */}
            <MenuDrawer currentUser={authUser}>
                <MenuItem onClick={logout}>
                    <Logout />
                    Logout
                </MenuItem>
            </MenuDrawer>

            <Stack
                direction="column"
                sx={{ flexGrow: 1, paddingLeft: '1em', paddingRight: '1em' }}
            >
                {displayNavigatedPage(nav)}
            </Stack>

            {/* Bottom Navigation */}
            <BottomNav nav={nav} setNav={setNav} />
        </DashboardContainer>
    );
}

const DashboardContainer = styled(Stack)({
    flex: '1 0 300px',
    margin: '10px',
    minHeight: '90vh',
    padding: '1em',
});

const MenuItem = styled(ListItemButton)({
    paddingLeft: '1.5em',
});
