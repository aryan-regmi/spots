import '../../App.css';
import './LoginPage.css';
import {
    ActionFunctionArgs,
    Link,
    useFetcher,
    useNavigate,
} from 'react-router-dom';
import Banner from '../../components/banner/Banner';
import useAuth from '../../components/auth/useAuth';
import useValidateAction, {
    ActionResponse,
} from '../../common/hooks/useValidateAction';
import { Stack } from '@mui/material';
import { StyledButton, StyledTextField } from '../../common/form/styled';
import { getUser, verifyPassword } from '../../api/users';
import { loadEndpoint } from '../../api/network';
import { useState } from 'react';

export default function LoginPage() {
    const { authorize } = useAuth();
    const navigate = useNavigate();
    const fetcher = useFetcher();
    useValidateAction<string>(fetcher, onValidLogin, onInvalidLogin);
    const [isValid, setIsValid] = useState(true);

    function onValidLogin(username: string) {
        setIsValid(true);
        console.info('Logged in user: ', username);

        // Authorize username
        authorize(username);

        // Load network endpoint
        loadEndpoint(username).then(() =>
            console.info('Network endpoint loaded')
        );

        // Go to homepage
        navigate('/home', { replace: true });
    }

    function onInvalidLogin(_: ActionResponse<string>) {
        // TODO: Replace with custom alert dialog
        alert('Invalid login: check username and password!');
        setIsValid(false);
    }

    return (
        <Stack className="content auth-page" direction="column">
            <Banner />

            {/* Login form */}
            <fetcher.Form method="post" action="/login">
                <Stack className="form-content" direction="column">
                    <StyledTextField
                        label="Username"
                        name="username"
                        type="text"
                        placeholder="Enter username..."
                        fullWidth
                        required
                        error={!isValid}
                        onChange={(_) => (isValid ? null : setIsValid(true))}
                    />
                    <StyledTextField
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Enter password..."
                        fullWidth
                        required
                        error={!isValid}
                        onChange={(_) => (isValid ? null : setIsValid(true))}
                    />

                    <div id="login-btn">
                        <StyledButton
                            type="submit"
                            variant="contained"
                            disabled={fetcher.state !== 'idle'}
                            color="primary"
                        >
                            {fetcher.state === 'submitting'
                                ? 'Logging in...'
                                : 'Login'}
                        </StyledButton>
                    </div>
                </Stack>
            </fetcher.Form>

            {/* Sign up link */}
            <Link to={'/signup'} id="signup-link">
                Sign Up
            </Link>
        </Stack>
    );
}

export async function loginAction({
    request,
}: ActionFunctionArgs): Promise<ActionResponse<string>> {
    // Extract form data
    const data = await request.formData();
    const username = data.get('username');
    const password = data.get('password');
    if (typeof username !== 'string' || typeof password !== 'string') {
        return {
            ok: false,
            error: 'Missing username or password',
        };
    }

    // Verfiy login in the backend
    const user = await getUser(username);
    if (!user) {
        return { ok: false, error: 'Username not found in database' };
    }
    const verified = await verifyPassword(username, password);
    if (!verified) {
        return { ok: false, error: 'Incorrect password' };
    }

    return { ok: true, data: username };
}
