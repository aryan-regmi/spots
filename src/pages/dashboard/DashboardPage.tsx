import BottomNav from './BottomNav';
import Loading from '@/components/loading/Loading';
import MenuDrawer, { menuIsOpenAtom } from '@/pages/dashboard/MenuDrawer';
import {
    Avatar,
    IconButton,
    ListItemButton,
    Stack,
    styled,
} from '@mui/material';
import { Logout } from '@mui/icons-material';
import { NavState } from '@/pages/dashboard/NavState';
import { atom, useAtom, useAtomValue } from 'jotai';
import { authContextActionAtom, authContextAtom } from '@/utils/auth/atoms';
import { closeEndpointAtom } from '@/utils/network/atoms';
import { stringAvatar } from '@/utils/stringAvatar';
import { useNavigate } from 'react-router-dom';
import Glassy from '@/components/Glassy';

export const navAtom = atom(NavState.Home);

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
        <GlassyDashboard direction="column">
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
            <div style={{ paddingBottom: '3em' }}>
                <BottomNav nav={nav} setNav={setNav} />
            </div>
        </GlassyDashboard>
    );
}

const DashboardContainer = styled(Stack)({
    flex: '1 0 300px',
    minHeight: '90vh',
    height: '100vh',
    padding: '1em',
});

const MenuItem = styled(ListItemButton)({
    paddingLeft: '1.5em',
});

const GlassyDashboard = Glassy(DashboardContainer);
