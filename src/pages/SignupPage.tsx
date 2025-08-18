import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usernameExists } from '../utils/sql';
import Database from '@tauri-apps/plugin-sql';
import './pages.css';
import { assert } from '../utils/common';

/** The signup page component. */
export function SignupPage(props: { db: Database | null }) {
    return (
        <div className="col">
            <SignupForm db={props.db} />
        </div>
    );
}

// FIXME: Setup database in App.tsx and pass to all pages!

/** The form responsible for handling user signups. */
function SignupForm(props: { db: Database | null }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const db = props.db;

    /** Checks if the username is available in the database. */
    async function validateLogin(db: Database, username: string) {
        return !(await usernameExists(db, username));
    }

    /** Validates the login (checks if username already exists). */
    function signupHandler(event: FormEvent) {
        event.preventDefault();
        if (db != null) {
            validateLogin(db, username).then((valid) => {
                if (valid) {
                    // Save to database
                    db.execute(
                        `INSERT INTO users (username, password) VALUES ($1,$2)`,
                        [username, password]
                    ).then((inserted) => {
                        assert(
                            inserted.rowsAffected == 1,
                            'Incorrect number of users inserted into the table'
                        );
                        console.log(`Inserted user: ${username}`);
                        navigate(`/home/${username}`, {
                            state: { username: username, password: password },
                            replace: true,
                        });
                    });
                } else {
                    alert(`Invalid username: ${username} already exists!`);
                }
            });
        } else {
            console.error('Invalid database');
        }
    }

    return (
        <form className="col" id="login-form" onSubmit={signupHandler}>
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
            />
        </form>
    );
}
