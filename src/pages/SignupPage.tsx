import './pages.css';
import Database from '@tauri-apps/plugin-sql';
import { useState } from 'react';
import { assert } from '../utils/common';
import { useNavigate } from 'react-router-dom';
import { usernameExists } from '../utils/sql';
import { insertRecord, StrongholdVault } from '../utils/stronghold';
import { hash } from 'argon2-wasm';

// TODO: Open stronghold and store username and passwords there!

/** The signup page component. */
export function SignupPage(props: { vault?: StrongholdVault; db?: Database }) {
    return (
        <div className="col">
            <SignupForm vault={props.vault} db={props.db} />
        </div>
    );
}

/** The form responsible for handling user signups. */
function SignupForm(props: { vault?: StrongholdVault; db?: Database }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { vault, db } = props;

    /** Checks if the username is available in the database. */
    async function validateUsername(db: Database, username: string) {
        return !(await usernameExists(db, username));
    }

    /** Validates and creates the login. */
    async function handleSignup() {
        if (db !== undefined && vault !== undefined) {
            let valid = await validateUsername(db, username);

            if (valid) {
                // Save user to database
                let insertedUser = await db.execute(
                    'INSERT INTO users (username) VALUES ($1)',
                    [username]
                );
                assert(
                    insertedUser.rowsAffected === 1,
                    'Incorrect number of users inserted into the table '
                );
                console.debug(
                    `(Database: ${db.path}) Inserted user: ${username}`
                );

                // Save login data in vault
                const decoder = new TextDecoder();
                const salt = crypto.getRandomValues(new Uint8Array(16));
                const hashed = await hash({
                    pass: password,
                    salt: salt,
                });
                await insertRecord(
                    vault.store,
                    `${username}.salt`,
                    decoder.decode(salt)
                );
                await insertRecord(
                    vault.store,
                    `${username}.password`,
                    hashed.encoded
                );
                await vault.stronghold.save();
                console.info(`User "${username}" registered.`);

                // Go to homepage
                navigate(`/home`, { replace: true });
            } else {
                alert(`Invalid username: "${username}" already exists!`);
            }
        } else {
            throw new Error('Invalid database or vault');
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
