import './pages.css';
import useAuth from '../hooks/useAuth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUsers } from '../hooks/useDatabase';
import { verifyPassword } from '../services/api/auth';
import { Icon } from '@mui/material';
import { GraphicEqRounded } from '@mui/icons-material';
import { useLoadNetworkEndpoint } from '../hooks/useNetwork';

/** The login page component. */
export function LoginPage() {
    const navigate = useNavigate();
    return (
        <div className="container">
            <div className="row" id="login-header">
                <Icon fontSize="large">
                    <GraphicEqRounded fontSize="large" />
                </Icon>
                <h2>Spots: A P2P Music App</h2>
            </div>
            <div className="col">
                <LoginForm />
                <a
                    onClick={(_) => {
                        navigate('/signup');
                    }}
                    className="text-link"
                >
                    Create User
                </a>
            </div>
        </div>
    );
}

/** The data returned by the `LoginForm` component. */
export type LoginData = {
    username: string;
    password: string;
};

/** The component responsible for handling user logins. */
export function LoginForm() {
    const navigate = useNavigate();
    const { authorize } = useAuth();
    const { data: users } = useGetUsers();
    const { mutateAsync: loadEndpoint } = useLoadNetworkEndpoint();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    /** Checks the username and password against the database. */
    async function validateLogin(username: string, password: string) {
        try {
            let user = users?.find((user) => user.username === username);
            if (user) {
                const verified = await verifyPassword(username, password);
                return verified;
            }
            return false;
        } catch (error) {
            console.error('Unable to validate login:', error);
        }
    }

    /** Validates the login (username and password) and redirects to the home page. */
    async function handleSubmit() {
        try {
            let valid = await validateLogin(username, password);
            if (valid) {
                // Update auth
                await authorize(username);

                // Load network endpoint
                console.log('Loading endpoint...');
                await loadEndpoint(username);
                console.log('Endpoint loaded');

                navigate('/home', { replace: true });
            } else {
                alert('Invalid login: check username and password!');
            }
        } catch (error) {
            console.error('Unable to login:', error);
        }
    }

    return (
        <form
            className="col"
            id="login-form"
            onSubmit={(e) => e.preventDefault()}
        >
            <div className="row">
                <label htmlFor="username-input">Username:</label>
                <input
                    id="username-input"
                    onChange={(e) => setUsername(e.currentTarget.value)}
                    placeholder="Enter username..."
                />
            </div>

            <div className="row">
                <label htmlFor="password-input">Password: </label>
                <input
                    id="password-input"
                    type="password"
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    placeholder="Enter password..."
                />
            </div>

            <input
                type="submit"
                value="Login"
                className="submit-button"
                onClick={handleSubmit}
            />
        </form>
    );
}
