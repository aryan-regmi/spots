import '../App.css';
import { useNavigate } from 'react-router-dom';
import useAuth from '../components/auth/useAuth';
import { closeEndpoint } from '../api/network';
import Loading from '../components/loading/Loading';
import { Button, Stack } from '@mui/material';

export default function HomePage() {
    const { unauthorize, currentUser, isLoading } = useAuth();
    const navigate = useNavigate();

    if (isLoading || !currentUser) {
        return <Loading />;
    }

    async function logout() {
        await unauthorize();
        await closeEndpoint();
        navigate('/login', { replace: true });
    }

    return (
        <Stack direction="column" className="home-container">
            {/* TODO: Add menu bar of some sort? */}
            <Button onClick={logout}>Log Out</Button>

            <Stack direction="row" className="pinned-playlists">
                {/*  TODO: Display playlists here! */}
            </Stack>
        </Stack>
    );
}
