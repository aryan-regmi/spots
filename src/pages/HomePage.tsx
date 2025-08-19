import './pages.css';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { getAuthUsername, removeAuth } from '../components/Authenticator';
import { Store } from '@tauri-apps/plugin-store';

type MockPlaylist = {
    id: string;
    title: string;
};

function newMockPlaylist(title: string) {
    let id = `${title.toLowerCase().replace(' ', '-')}`;
    return { title: title, id: id };
}

export function HomePage(props: { store: Store | null }) {
    const navigate = useNavigate();

    const { store } = props;
    const username = getAuthUsername(store);

    /** Redirects to the login page. */
    async function redirectToLogin() {
        await removeAuth(store);
        await navigate('/login', { replace: true });
    }

    /** Opens the specified playlist with the given title. */
    async function openPlaylist(playlist: MockPlaylist) {
        await navigate(`/playlist/${playlist.id}`, {
            state: playlist.title,
        });
    }

    const mockPlaylists: MockPlaylist[] = [
        newMockPlaylist('Playlist 1'),
        newMockPlaylist('Playlist 2'),
    ];

    return (
        <div className="container">
            <h2>Welcome {username}!</h2>

            {/* TODO: Display pinned playlists */}
            <div className="content">
                <div className="row">
                    {mockPlaylists.map((playlist) => (
                        <Card
                            key={playlist.id}
                            onClick={async () => await openPlaylist(playlist)}
                        >
                            {playlist.title}
                        </Card>
                    ))}
                </div>
            </div>

            <footer className="footer">
                <a onClick={redirectToLogin} className="text-link">
                    Log Out
                </a>
            </footer>
        </div>
    );
}
