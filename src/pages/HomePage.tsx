import { redirect, useLocation, useNavigate } from 'react-router-dom';
import './pages.css';
import { UserData } from '../utils/common';
import { Card } from '../components/Card/Card';
import { getAuthData, useAuth } from '../components/Authenticator';
import { load, Store } from '@tauri-apps/plugin-store';

type MockPlaylist = {
    id: string;
    title: string;
};

function newMockPlaylist(title: string) {
    let id = `${title.toLowerCase().replace(' ', '-')}`;
    return { title: title, id: id };
}

export async function homePageLoader({ props }: any) {
    const { store } = props;
    let auth = await getAuthData(store);
    if (!auth?.isValid) {
        return redirect('/login');
    }
    return <HomePage username={auth.username!} />;
}

export function HomePage(props: { username: string }) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    let { username } = props;

    /** Logs the user out and redirects to the login page. */
    async function redirectToLogin() {
        await logout();
        await navigate('/login', { replace: true });
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
