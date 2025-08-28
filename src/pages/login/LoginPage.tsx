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
import { Alert, Stack } from '@mui/material';
import { StyledButton, StyledTextField } from '../../common/form/styled';
import { getUser, verifyPassword } from '../../api/users';
import { loadEndpoint } from '../../api/network';
import { useState } from 'react';

export default function LoginPage() {
    const { authorize } = useAuth();
    const navigate = useNavigate();
    const fetcher = useFetcher();
    useValidateAction<string, ResponseError>(
        fetcher,
        onValidLogin,
        onInvalidLogin
    );
    const [isValid, setIsValid] = useState({ username: true, password: true });
    const [errMsg, setErrMsg] = useState<string>();

    function onValidLogin(username: string) {
        setIsValid({ username: true, password: true });
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

    function onInvalidLogin(response: ActionResponse<string, ResponseError>) {
        const error = response?.error;
        if (!error) {
            setIsValid({ username: false, password: false });
            setErrMsg('Unknown error');
            return;
        }

        switch (error) {
            case 'Username not found':
                setIsValid({ username: false, password: isValid.password });
                break;
            case 'Incorrect password':
                setIsValid({ username: isValid.username, password: false });
                break;
            default:
                setIsValid({ username: false, password: false });
                break;
        }

        setErrMsg(response?.error);
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
                        error={!isValid.username}
                        onChange={(_) =>
                            isValid.username
                                ? null
                                : setIsValid({
                                      username: true,
                                      password: isValid.password,
                                  })
                        }
                    />
                    <StyledTextField
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Enter password..."
                        fullWidth
                        required
                        error={!isValid.password}
                        onChange={(_) =>
                            isValid.password
                                ? null
                                : setIsValid({
                                      username: isValid.username,
                                      password: true,
                                  })
                        }
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

            {/* Error alerts */}
            {errMsg ? (
                <Alert severity="error" variant="filled">
                    {errMsg}
                </Alert>
            ) : null}
        </Stack>
    );
}

type ResponseError =
    | 'Missing username or password'
    | 'Username not found'
    | 'Incorrect password';

export async function loginAction({
    request,
}: ActionFunctionArgs): Promise<ActionResponse<string, ResponseError>> {
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
        return { ok: false, error: 'Username not found' };
    }
    const verified = await verifyPassword(username, password);
    if (!verified) {
        return { ok: false, error: 'Incorrect password' };
    }

    return { ok: true, data: username };
}
