import { useNavigate, useParams, useLocation } from 'react-router-dom';

export function PlaylistPage() {
    const navigate = useNavigate();
    const { username, playlistId } = useParams<{
        username: string;
        playlistId: string;
    }>();
    const location = useLocation();
    const title = location.state || `${playlistId}`;

    // Mock data - replace with actual fetching if needed
    const mockItems = ['Song A', 'Song B', 'Song C'];

    return (
        <div style={{ padding: 20 }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
                ← Back
            </button>
            <h1>{title}</h1>
            <ul>
                {mockItems.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
}
