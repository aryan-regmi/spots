import './pages.css';
import useAuth from '../hooks/useAuth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Database from '@tauri-apps/plugin-sql';
import { getUserRecord } from '../utils/sql';
import { invoke } from '@tauri-apps/api/core';

/** The login page component. */
export function LoginPage(props: { db?: Database }) {
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
                    Create User
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
export function LoginForm(props: { db?: Database }) {
    const navigate = useNavigate();
    const { authorize } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { db } = props;

    /** Checks the username and password against the database. */
    async function validateLogin(
        db: Database,
        username: string,
        password: string
    ) {
        const userRecord = await getUserRecord(db, username);
        if (userRecord) {
            if (userRecord.password) {
                const verified = await invoke('verify_password', {
                    password: password,
                    hash: userRecord.password,
                });
                return verified;
            }
        }
    }

    /** Validates the login (username and password) and redirects to the home page. */
    async function handleSubmit() {
        if (db !== undefined) {
            let valid = await validateLogin(db, username, password);
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
