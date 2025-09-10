import Container from '@/components/Container';
import useTransitionNavigate from '@/utils/hooks/useTransitionNavigate';
import { Button, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';

export default function PlaylistPage() {
    const { playlistId } = useParams();
    const transitionNav = useTransitionNavigate();

    return (
        <Container style={{ color: 'white' }}>
            <Stack direction={'column'}>
                <p>Playlist #{playlistId}</p>
                <div>
                    <Button color="error" onClick={() => transitionNav(-1)}>
                        Back
                    </Button>
                </div>
            </Stack>
        </Container>
    );
}
