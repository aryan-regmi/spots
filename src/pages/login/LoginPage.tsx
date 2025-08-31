import '@/App.css';
import '@/pages/login/LoginPage.css';
import Banner from '@/components/banner/Banner';
import useLoadEndpoint from '@/utils/hooks/network/useLoadEndpoint';
import { Alert, CircularProgress, Stack } from '@mui/material';
import { Form, Link, useNavigate } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { StyledButton, StyledTextField } from '@/utils/form/styled';
import { authContextAtom } from '@/components/auth/Auth';
import { getUser, verifyPassword } from '@/api/users';
import { useAtomValue } from 'jotai';

export default function LoginPage() {
    const { authorize, isLoading } = useAtomValue(authContextAtom);
    const navigate = useNavigate();
    const loadEndpoint = useLoadEndpoint();

    const [isValid, setIsValid] = useState({ username: true, password: true });
    const [errMsg, setErrMsg] = useState<string>();
    const [validating, setValidating] = useState(false);
    const isBusy = isLoading || loadEndpoint.isPending || validating;

    async function validateLogin(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = formData.get('username');
        const password = formData.get('password');
        setValidating(true);

        if (typeof username === 'string' && typeof password === 'string') {
            // Validate username
            const user = await getUser(username);
            if (!user) {
                setIsValid({ username: false, password: isValid.password });
                setErrMsg('Username not found!');
                setValidating(false);
                return;
            }

            // Validate password
            const verified = await verifyPassword(username, password);
            if (!verified) {
                setIsValid({ username: isValid.username, password: false });
                setErrMsg('Incorrect password!');
                setValidating(false);
                return;
            }

            setIsValid({ username: true, password: true });
            setErrMsg(undefined);

            // Authorize username
            await authorize(username);

            // Load network endpoint
            await loadEndpoint.mutateAsync(username);

            // Go to homepage
            setValidating(false);
            await navigate('/home', { replace: true });
        }
    }

    return (
        <Stack className="content auth-page" direction="column">
            <Banner />

            {/* Login form */}
            <Form onSubmit={validateLogin}>
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
                            disabled={isBusy}
                            color="primary"
                        >
                            {isBusy ? 'Logging in...' : 'Login'}
                        </StyledButton>
                    </div>
                    <div
                        style={{
                            textAlign: 'center',
                        }}
                    >
                        {isBusy ? <CircularProgress /> : null}
                    </div>
                </Stack>
            </Form>

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
