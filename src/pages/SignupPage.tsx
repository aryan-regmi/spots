import './pages.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useAddUser, useGetUsers } from '../hooks/useDatabase';
import { hashPassword } from '../services/api/auth';

/** The signup page component. */
export function SignupPage() {
    return (
        <div className="col">
            <SignupForm />
        </div>
    );
}

/** The form responsible for handling user signups. */
function SignupForm() {
    const navigate = useNavigate();
    const { authorize } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { data: users } = useGetUsers();
    const { mutateAsync: addUser } = useAddUser();

    /** Checks if the username is available in the database. */
    async function validateUsername(username: string) {
        let user = users?.find((user) => user.username === username);
        return user === undefined; // Only true if no user by that name
    }

    /** Validates and creates the login. */
    async function handleSignup() {
        let valid = await validateUsername(username);

        if (valid) {
            // Create salt and hash password
            const hashedPassword = await hashPassword(password);

            // Save user to database
            await addUser({ username, password: hashedPassword });
            console.info(`Created new user: ${username}`);

            // Go to homepage
            await authorize(username);
            navigate(`/home`, { replace: true });
        } else {
            alert(`Invalid username: "${username}" already exists!`);
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
