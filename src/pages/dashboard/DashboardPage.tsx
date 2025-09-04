import BottomNav from './BottomNav';
import Container from '@/components/Container';
import Library from './library/Library';
import Loading from '@/components/loading/Loading';
import MenuDrawer, { menuIsOpenAtom } from '@/pages/dashboard/MenuDrawer';
import useTransitionNavigate from '@/utils/hooks/useTransitionNavigate';
import {
    Avatar,
    Fade,
    IconButton,
    ListItemButton,
    Modal,
    Stack,
    styled,
    Typography,
} from '@mui/material';
import { Logout } from '@mui/icons-material';
import { NavState } from '@/pages/dashboard/NavState';
import { atom, useAtom, useAtomValue } from 'jotai';
import { authContextActionAtom, authContextAtom } from '@/utils/auth/atoms';
import { closeEndpointAtom } from '@/utils/network/atoms';
import { stringAvatar } from '@/utils/stringAvatar';
import { useEffect } from 'react';

const navAtom = atom(NavState.Home);
const isLoggingOutAtom = atom(false);

export default function DashboardPage() {
    const transitionNavigate = useTransitionNavigate();
    const { authUser, isLoading } = useAtomValue(authContextAtom);
    const { unauthorize } = useAtomValue(authContextActionAtom);
    const closeEndpoint = useAtomValue(closeEndpointAtom);

    /* State */
    const [menuIsOpen, setMenuIsOpen] = useAtom(menuIsOpenAtom);
    const [isLoggingOut, setIsLoggingOut] = useAtom(isLoggingOutAtom);
    const [nav, setNav] = useAtom(navAtom);

    /* Reset nav when unmounted */
    useEffect(() => {
        return () => {
            setNav(NavState.Home);
            setIsLoggingOut(false);
        };
    }, []);

    /* Handle loading state */
    if (isLoading || !authUser) {
        return <Loading />;
    }

    /* Removes authentication, closes network endpoint, and navigates to the login page.  */
    async function logout() {
        setIsLoggingOut(true);
        toggleMenuDrawer();
        await unauthorize();
        await closeEndpoint.mutateAsync();
        transitionNavigate('/login', { replace: true });
    }

    /* Toggles the menu drawer. */
    async function toggleMenuDrawer() {
        setMenuIsOpen(!menuIsOpen);
    }

    /* Displays the currently selected dashboard page. */
    function displayNavigatedPage(nav: NavState) {
        switch (nav) {
            case NavState.Home:
                return <div>Home</div>;
            case NavState.Search:
                return <div>Search</div>;
            case NavState.Library:
                return <Library />;
        }
    }

    return (
        <StyledContainer direction="column">
            <IconButton
                style={{
                    justifyContent: 'left',
                    width: 'fit-content',
                }}
                onClick={toggleMenuDrawer}
            >
                <Avatar {...stringAvatar(authUser.username)} />
            </IconButton>

            {/* Menu drawer  */}
            <MenuDrawer currentUser={authUser.username}>
                <MenuItem onClick={logout}>
                    <Logout />
                    Logout
                </MenuItem>
            </MenuDrawer>

            {/* Loggin out spinner */}
            <Modal open={isLoggingOut}>
                <Fade>
                    <Loading spinnerStyle={{ color: 'white' }}>
                        <Typography
                            variant="body1"
                            color="darkgray"
                            style={{ paddingTop: '1em' }}
                        >
                            Logging out...
                        </Typography>
                    </Loading>
                </Fade>
            </Modal>

            {/* Contents */}
            <Stack
                direction="column"
                sx={{ flexGrow: 1, paddingLeft: '1em', paddingRight: '1em' }}
            >
                {displayNavigatedPage(nav)}
            </Stack>

            {/* Bottom Navigation */}
            <div style={{ paddingBottom: '1em' }}>
                <BottomNav nav={nav} setNav={setNav} />
            </div>
        </StyledContainer>
    );
}

const StyledContainer = styled(Container)({
    justifyContent: 'center',
});

const MenuItem = styled(ListItemButton)({
    paddingLeft: '1.5em',
});
