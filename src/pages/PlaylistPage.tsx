import { useParams, useLocation } from 'react-router-dom';
import { BackButton } from '../components/BackButton';

export function PlaylistPage() {
    const { playlistId } = useParams<{
        playlistId: string;
    }>();
    const location = useLocation();
    const title = location.state || `${playlistId}`;

    // Mock data - replace with actual fetching of playlist
    const mockItems = ['Song A', 'Song B', 'Song C'];

    return (
        <div>
            <BackButton />
            <div>
                <h1>{title}</h1>
                <ul>
                    {mockItems.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
