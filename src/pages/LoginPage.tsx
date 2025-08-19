import './pages.css';
import { useNavigate } from 'react-router-dom';
import Database from '@tauri-apps/plugin-sql';
import { UserData } from '../utils/common';
import { useState } from 'react';
import { passwordIsCorrect, usernameExists } from '../utils/sql';
import { Store } from '@tauri-apps/plugin-store';
import { setAuth } from '../components/Authenticator';

/** The login page component. */
export function LoginPage(props: { db: Database | null; store: Store | null }) {
    const { db, store } = props;

    const navigate = useNavigate();

    return (
        <main className="container">
            <h1>Spots: A Spotify Alternative</h1>
            <div className="col">
                <LoginForm db={db} store={store} />
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

/** The type of the function that handles the data returned by the `LoginForm` component. */
export type LoginDataHandlerFn = (data: UserData) => void;

/** The component responsible for handling user logins. */
export function LoginForm(props: { db: Database | null; store: Store | null }) {
    const { db, store } = props;

    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

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

    /** Validates login and redirects to the home page. */
    async function handleLogin() {
        if (db != null) {
            validateLogin(db, username, password).then(async (valid) =>
                valid
                    ? await setAuth(store, username)
                    : alert('Invalid login: check username and password!')
            );
        } else {
            throw new Error('Invalid database');
        }
        navigate(`/home`, { replace: true });
    }

    return (
        <form
            className="col"
            id="login-form"
            onSubmit={(e) => e.preventDefault()}
        >
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
                onClick={handleLogin}
            />
        </form>
    );
}
