import BottomNav from '@/pages/dashboard/BottomNav';
import Container from '@/components/Container';
import Library from '@/pages/dashboard/library/Library';
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
import { useEffect, useState } from 'react';
import MusicPlayer from '@/components/player/MusicPlayer';

/** Manages the dashboard navigation. */
export const dashboardNavAtom = atom(NavState.Home);

export default function DashboardPage() {
    const transitionNavigate = useTransitionNavigate();
    const { authUser, isLoading } = useAtomValue(authContextAtom);
    const { unauthorize } = useAtomValue(authContextActionAtom);
    const closeEndpoint = useAtomValue(closeEndpointAtom);

    /// Determines if the menu drawer is open.
    const [menuIsOpen, setMenuIsOpen] = useAtom(menuIsOpenAtom);

    /// Determines if user is logging out (used to show logout page)
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    /// The selected navigation page.
    const [nav, setNav] = useAtom(dashboardNavAtom);

    /// The displayed navigation page.
    //
    /// Different from [nav] to manage transitions.
    const [displayNav, setDisplayNav] = useState(nav);

    // Manages the navigation fade in.
    const [fadeIn, setFadeIn] = useState(true);
    const fadeTimeout = 200;

    // Animate when nav changes
    useEffect(() => {
        if (displayNav !== nav) {
            setFadeIn(false);
            const timeoutId = setTimeout(() => {
                setDisplayNav(nav);
                setFadeIn(true);
            }, fadeTimeout);

            return () => clearTimeout(timeoutId);
        }

        return () => setDisplayNav(nav);
    }, [nav, displayNav]);

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
        setNav(NavState.Home);
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
                <Fade in={fadeIn} timeout={fadeTimeout}>
                    <div>{displayNavigatedPage(displayNav)}</div>
                </Fade>
            </Stack>

            <MusicPlayer />

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
