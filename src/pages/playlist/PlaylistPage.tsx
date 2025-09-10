import { useParams } from 'react-router-dom';

export default function PlaylistPage() {
    const { playlistId } = useParams();

    return <div style={{ color: 'white' }}>Playlist #{playlistId}</div>;
}
