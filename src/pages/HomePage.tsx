import './pages.css';
import useAuth from '../hooks/useAuth';
import { Card } from '../components/Card/Card';
import { LoadingPage } from './LoadingPage';
import { useNavigate } from 'react-router-dom';
import Database from '@tauri-apps/plugin-sql';

type MockPlaylist = {
    id: string;
    title: string;
};

function newMockPlaylist(title: string, username?: string) {
    let fixedTitle = title.toLowerCase().replace(' ', '-');
    let id = username ? `${username}-${fixedTitle}` : fixedTitle;
    return { title: title, id: id };
}

export function HomePage(props: { db?: Database }) {
    const { unauthorize, currentUser: username } = useAuth();
    const navigate = useNavigate();

    if (!username) {
        return <LoadingPage />;
    }

    /** Logs the user out and redirects to the login page. */
    async function redirectToLogin() {
        await unauthorize();
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
        <div className="container ">
            <h2>{`Welcome ${username}!`}</h2>

            {/* TODO: Display pinned playlists */}
            <main className="content">
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
            </main>

            <footer className="footer">
                <a onClick={redirectToLogin} className="text-link">
                    Log Out
                </a>
            </footer>
        </div>
    );
}
