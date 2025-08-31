import NavState from '@/pages/dashboard/NavState';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
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
