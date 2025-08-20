import { useNavigate } from 'react-router-dom';
import './pages.css';
import Database from '@tauri-apps/plugin-sql';
import { FormEvent, useState } from 'react';
import { passwordIsCorrect, usernameExists } from '../utils/sql';
import { useAuth } from '../components/Authenticator';
import { Store } from '@tauri-apps/plugin-store';

/** The login page component. */
export function LoginPage(props: { db: Database | null; store: Store | null }) {
    const navigate = useNavigate();
    return (
        <main className="container">
            <h1>Spots: A Spotify Alternative</h1>
            <div className="col">
                <LoginForm db={props.db} />
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

/** The data returned by the `LoginForm` component. */
export type LoginData = {
    username: string;
    password: string;
};

/** The component responsible for handling user logins. */
export function LoginForm(props: { db: Database | null }) {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const db = props.db;

    /** Checks the username and password against the database. */
    async function validateLogin(
        db: Database,
        username: string,
        password: string
    ) {
        return (
            (await usernameExists(db, username)) &&
            (await passwordIsCorrect(db, username, password))
        );
    }

    /** Validates the login (username and password) and redirects to the home page. */
    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (db != null) {
            validateLogin(db, username, password).then(async (valid) => {
                if (valid) {
                    await login(username);
                    navigate(`/home/`, { replace: true });
                } else {
                    alert('Invalid login: check username and password!');
                }
            });
        } else {
            throw new Error('Invalid database: database was null');
        }
    }

    return (
        <form className="col" id="login-form" onSubmit={handleSubmit}>
            <div className="row">
                Username:
                <input
                    id="username-input"
                    onChange={(e) => setUsername(e.currentTarget.value)}
                    placeholder="Enter username..."
                />
            </div>

            <div className="row">
                Password:
                <input
                    id="password-input"
                    type="password"
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    placeholder="Enter password..."
                />
            </div>

            <input
                type="submit"
                placeholder="Login"
                className="submit-button"
            />
        </form>
    );
}
