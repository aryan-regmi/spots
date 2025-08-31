import { Avatar, Button, Divider, List, Stack, styled } from '@mui/material';
import { atom, useAtom } from 'jotai';
import { CSSProperties } from 'react';
import { stringAvatar } from '@/utils/stringAvatar';
import { useNavigate } from 'react-router-dom';
import NavDrawer from '@/components/nav/NavDrawer';

export const menuIsOpenAtom = atom(false);

export default function MenuDrawer(props: {
    currentUser: string;
    children: any;
}) {
    const navigate = useNavigate();
    const { currentUser, children } = props;

    /* State */
    const [menuIsOpen, setMenuIsOpen] = useAtom(menuIsOpenAtom);

    async function toggleMenu() {
        setMenuIsOpen(!menuIsOpen);
    }

    async function showProfile() {
        toggleMenu();
        await navigate('/dashboard/profile');
    }

    return (
        <NavDrawer
            open={menuIsOpen}
            onClose={toggleMenu}
            style={{ backgroundColor: '#1f2f2f' }}
        >
            {/* Menu header */}
            <MenuHeaderBtn sx={menuHeaderInnerStyle} onClick={showProfile}>
                <Stack direction="column">
                    <MenuHedaderInnerRow direction="row">
                        <Avatar {...stringAvatar(currentUser)} />
                        <div style={avatarTextStyle}>{currentUser}</div>
                    </MenuHedaderInnerRow>
                    <a style={viewProfileTextStyle}>View Profile</a>
                </Stack>
            </MenuHeaderBtn>
            <Divider color="black" style={{ paddingTop: '0.05em' }} />

            {/* Menu items */}
            <List>{children}</List>
        </NavDrawer>
    );
}

const MenuHeaderBtn = styled(Button)({
    backgroundColor: '#1f1f1f',
    paddingTop: '1em',
    paddingLeft: '1.5em',
    marginBottom: 0,
    paddingBottom: 0,
    cursor: 'pointer',
    userSelect: 'none',
    justifyContent: 'left',
});

const menuHeaderInnerStyle: CSSProperties = {
    textTransform: 'none',
    borderRadius: 0,
};

const MenuHedaderInnerRow = styled(Stack)({
    justifyContent: 'left',
    gap: '0.1em',
});

const avatarTextStyle: CSSProperties = {
    color: 'white',
    paddingLeft: '0.25em',
    fontSize: '2em',
};

const viewProfileTextStyle: CSSProperties = {
    fontSize: '0.8em',
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: '1.5em',
    marginTop: '-0.5em',
    marginBottom: 0,
    color: 'gray',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
};
