import Container from '@/components/Container';
import { useParams } from 'react-router-dom';

export default function PlaylistPage() {
    const { playlistId } = useParams();

    return (
        <Container style={{ color: 'white' }}>Playlist #{playlistId}</Container>
    );
}
