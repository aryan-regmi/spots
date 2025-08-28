import '../../App.css';
import './LoginPage.css';
import {
    useFetcher,
    ActionFunctionArgs,
    useNavigate,
    Link,
} from 'react-router-dom';
import { Button, Icon, Stack, styled, TextField } from '@mui/material';
import { GraphicEq } from '@mui/icons-material';
import { getUser, verifyPassword } from '../../api/users';
import useAuth from '../../components/auth/useAuth';
import { loadEndpoint } from '../../api/network';
import useValidateAction, {
    ActionResponse,
} from '../../components/common/hooks/useValidateAction';
import { useState } from 'react';

const StyledTextField = styled(TextField)({
    input: {
        color: 'white',
    },
    label: {
        color: '#FFE3DC',
    },
    '& .MuiOutlinedInput-root': {
        backgroundColor: '#2f2f2f',
    },
});

const StyledButton = styled(Button)({
    ':disabled': {
        color: 'white',
    },
});

export default function LoginPage() {
    const navigate = useNavigate();
    const fetcher = useFetcher();
    const { authorize } = useAuth();
    useValidateAction<string>(fetcher, onValidLogin, onInvalidLogin);
    const [isValid, setIsValid] = useState(true);

    function onValidLogin(username: string) {
        setIsValid(true);

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
        <Stack className="content login-container" direction="column">
            {/* Header */}
            <Stack className="login-header" direction="row">
                <div className="stack-item">
                    <Icon fontSize="large">
                        <GraphicEq fontSize="large"></GraphicEq>
                    </Icon>
                </div>
                <div className="stack-item">
                    <h2>Spots</h2>
                </div>
            </Stack>

            {/* Login form */}
            <fetcher.Form method="post" action="/login">
                <Stack className="form-content" direction="column">
                    <StyledTextField
                        className="test"
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
