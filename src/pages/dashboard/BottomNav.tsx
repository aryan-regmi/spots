import NavState from '@/pages/dashboard/NavState';
import {
    BottomNavigation,
    BottomNavigationAction,
    styled,
} from '@mui/material';
import { Home, Search, List as ListIcon } from '@mui/icons-material';

export default function BottomNav(props: { nav: NavState; setNav: any }) {
    const { nav, setNav } = props;

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
            <StyledNavAction label="Home" icon={<Home />} />
            <StyledNavAction label="Search" icon={<Search />} />
            <StyledNavAction label="Library" icon={<ListIcon />} />
        </BottomNavigation>
    );
}

const StyledNavAction = styled(BottomNavigationAction)({
    color: 'darkgray',
    '&.Mui-selected': {
        opacity: 1,
        color: 'white',
    },
});
