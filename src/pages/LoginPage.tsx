import './pages.css';
import useAuth from '../hooks/useAuth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecord, StrongholdVault } from '../utils/stronghold';
import { hash } from 'argon2-wasm';

/** The login page component. */
export function LoginPage(props: { vault?: StrongholdVault }) {
    const navigate = useNavigate();
    return (
        <main className="container">
            <h1>Spots: A Spotify Alternative</h1>
            <div className="col">
                <LoginForm vault={props.vault} />
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
export function LoginForm(props: { vault?: StrongholdVault }) {
    const navigate = useNavigate();
    const { authorize } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { vault } = props;

    /** Checks the username and password against the database. */
    async function validateLogin(
        vault: StrongholdVault,
        username: string,
        password: string
    ) {
        if (!vault.store) throw new Error('Stronghold not initialized');
        const encoder = new TextEncoder();

        // Get stored data
        const storedSalt = await getRecord(vault.store, `${username}.salt`);
        const storedPass = await getRecord(vault.store, `${username}.password`);
        if (!storedSalt || !storedPass) {
            return false;
        }
        const salt = new Uint8Array(encoder.encode(storedSalt));

        // Hash given password and compare to stored password
        const hashedInput = await hash({ pass: password, salt: salt });
        return hashedInput.encoded === storedPass;
    }

    /** Validates the login (username and password) and redirects to the home page. */
    async function handleSubmit() {
        if (vault !== undefined) {
            let valid = await validateLogin(vault, username, password);
            if (valid) {
                await authorize(username);
                navigate('/home', { replace: true });
            } else {
                alert('Invalid login: check username and password!');
            }
        } else {
            throw new Error('Invalid database');
        }
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
                onClick={handleSubmit}
            />
        </form>
    );
}
