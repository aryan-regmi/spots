import Container from '@/components/Container';
import useTransitionNavigate from '@/utils/hooks/useTransitionNavigate';
import { ArrowBack } from '@mui/icons-material';
import { CSSProperties, IconButton, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';

export default function PlaylistPage() {
    const { playlistId } = useParams();
    const transitionNav = useTransitionNavigate();

    return (
        <Container style={{ color: 'white' }}>
            <Stack direction={'column'}>
                <IconButton sx={backBtnStyle} onClick={() => transitionNav(-1)}>
                    <ArrowBack />
                </IconButton>
            </Stack>
        </Container>
    );
}

const backBtnStyle: CSSProperties = {
    width: 'fit-content',
    marginBottom: '-3.5em',
    fontSize: 'large',
    color: 'white',
    marginLeft: '-0.5em',
};
