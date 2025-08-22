import './pages.css';
import Database from '@tauri-apps/plugin-sql';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { insertUserLogin, usernameExists } from '../utils/sql';
import { invoke } from '@tauri-apps/api/core';
import useAuth from '../hooks/useAuth';

// TODO: Open stronghold and store username and passwords there!

/** The signup page component. */
export function SignupPage(props: { db?: Database }) {
    return (
        <div className="col">
            <SignupForm db={props.db} />
        </div>
    );
}

/** The form responsible for handling user signups. */
function SignupForm(props: { db?: Database }) {
    const { authorize } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { db } = props;

    /** Checks if the username is available in the database. */
    async function validateUsername(db: Database, username: string) {
        return !(await usernameExists(db, username));
    }

    /** Validates and creates the login. */
    async function handleSignup() {
        if (db !== undefined) {
            let valid = await validateUsername(db, username);

            if (valid) {
                // Create salt and hash password
                const hashedPassword = await invoke<string>('hash_password', {
                    password: password,
                });

                // Save user to database
                await insertUserLogin(db, username, hashedPassword);
                console.info(`Created new user: ${username}`);

                // Go to homepage
                await authorize(username);
                navigate(`/home`, { replace: true });
            } else {
                alert(`Invalid username: "${username}" already exists!`);
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
                placeholder="Create Login"
                className="submit-button"
                onClick={handleSignup}
            />
        </form>
    );
}
