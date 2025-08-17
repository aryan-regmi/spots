import { LoginForm } from '../components/LoginForm';
import { useNavigate } from 'react-router-dom';
import './pages.css';
import Database from '@tauri-apps/plugin-sql';
import { UserData } from '../utils/common';

/** The login page component. */
export function LoginPage(props: { db: Database }) {
    const navigate = useNavigate();

    /** Handles logging in by navigating to the home page. */
    function loginHandler(data: UserData) {
        navigate('/home', {
            state: data,
        });
    }

    return (
        <main className="container">
            <h1>Spots: A Spotify Alternative</h1>
            <div className="col">
                <LoginForm db={props.db} loginHandler={loginHandler} />
                <a
                    onClick={(_) => {
                        navigate('/signup');
                    }}
                    className="text-link"
                >
                    Sign Up
                </a>
            </div>
        </main>
    );
}
