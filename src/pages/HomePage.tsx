import { useLocation, useNavigate } from 'react-router-dom';
import './pages.css';
import { UserData } from '../utils/common';
import { Card } from '../components/Card';
import { useAuth } from '../components/Authenticator';

type MockPlaylist = {
    id: string;
    title: string;
};

function newMockPlaylist(title: string) {
    let id = `${title.toLowerCase().replace(' ', '-')}`;
    return { title: title, id: id };
}

export function HomePage() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const loginInfo: UserData = location.state;
    let username = loginInfo.username;

    /** Redirects to the login page. */
    async function redirectToLogin() {
        // await logout();
        // await navigate('/login', { replace: true });
        await navigate('/', { replace: true });
    }

    /** Opens the specified playlist with the given title. */
    async function openPlaylist(playlist: MockPlaylist) {
        await navigate(`./playlists/${playlist.id}`, {
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
