import { useLocation, useNavigate } from 'react-router-dom';
import './pages.css';
import { UserData } from '../utils/common';
import { Card } from '../components/Card';

type MockPlaylist = {
    id: string;
    title: string;
};

function newMockPlaylist(title: string) {
    let id = `${title.toLowerCase().replace(' ', '-')}`;
    return { title: title, id: id };
}

export function HomePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const loginInfo: UserData = location.state!;
    let username = loginInfo.username;

    /** Redirects to the login page. */
    function redirectToLogin() {
        navigate('/login');
    }

    /** Opens the specified playlist with the given title. */
    function openPlaylist(playlist: MockPlaylist) {
        navigate(`./playlists/${playlist.id}`, {
            state: playlist.title,
        });
    }

    const mockPlaylists: MockPlaylist[] = [
        newMockPlaylist('Playlist 1'),
        newMockPlaylist('Playlist 2'),
    ];

    return (
        <div className="container">
            {/* <div className="row"> */}
            <h2>Welcome {username}!</h2>
            {/* </div> */}

            {/* TODO: Display pinned playlists */}
            <div className="content">
                <div className="row">
                    {mockPlaylists.map((playlist) => (
                        <Card
                            key={playlist.id}
                            onClick={() => openPlaylist(playlist)}
                        >
                            {playlist.title}
                        </Card>
                    ))}

                    {/* <Card */}
                    {/*     onClick={() => */}
                    {/*         openPlaylist(newMockPlaylist('Playlist 1')) */}
                    {/*     } */}
                    {/* > */}
                    {/*     Playlist 1 */}
                    {/* </Card> */}
                    {/* <Card>Playlist 2</Card> */}
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
