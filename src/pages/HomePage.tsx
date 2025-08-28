import { useNavigate } from 'react-router-dom';
import useAuth from '../components/auth/useAuth';
import { closeEndpoint } from '../api/network';
import { CircularProgress } from '@mui/material';

export default function HomePage() {
    const { unauthorize, currentUser, isLoading } = useAuth();
    const navigate = useNavigate();

    if (isLoading || !currentUser) {
        return <CircularProgress />;
    }

    async function logout() {
        await unauthorize();
        await closeEndpoint();
        navigate('/login', { replace: true });
    }

    return (
        <div>
            <button type="button" onClick={logout}>
                Logout
            </button>
        </div>
    );
}
