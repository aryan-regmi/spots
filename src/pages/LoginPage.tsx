import { useNavigate } from 'react-router-dom';
import './pages.css';
import Database from '@tauri-apps/plugin-sql';
import { UserData } from '../utils/common';
import { FormEvent, useState } from 'react';
import { passwordIsCorrect, usernameExists } from '../utils/sql';

/** The login page component. */
export function LoginPage(props: { db: Database | null }) {
    const navigate = useNavigate();

    /** Handles logging in by navigating to the home page. */
    function loginHandler(data: UserData) {
        navigate(`/home/${data.username}`, {
            state: data,
            replace: true,
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

/** The type of the function that handles the data returned by the `LoginForm` component. */
export type LoginDataHandlerFn = (data: UserData) => void;

/** Checks the username and password against the database. */
async function validateLogin(db: Database, username: string, password: string) {
    return (
        (await usernameExists(db, username)) &&
        (await passwordIsCorrect(db, username, password))
    );
}

/** The component responsible for handling user logins. */
export function LoginForm(props: {
    db: Database | null;
    loginHandler: LoginDataHandlerFn;
}) {
    const { loginHandler: loginDataHandler } = props;
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const db = props.db;

    /** Validates the login (username and password). */
    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (db != null) {
            validateLogin(db, username, password).then((valid) => {
                if (valid) {
                    loginDataHandler({
                        username: username,
                        password: password,
                    });
                } else {
                    alert('Invalid login: check username and password!');
                }
            });
        } else {
            console.error('Invalid database');
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
