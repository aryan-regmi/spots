import '@/App.css';
import '@/pages/login/LoginPage.css';
import Banner from '@/components/banner/Banner';
import { Alert, CircularProgress, Stack } from '@mui/material';
import { Form, Link, useNavigate } from 'react-router-dom';
import { FormEvent } from 'react';
import { StyledButton, StyledTextField } from '@/utils/form/styled';
import { authContextActionAtom, authContextAtom } from '@/utils/auth/atoms';
import { getUserAtom } from '@/utils/users/atoms';
import { loadEndpointAtom } from '@/utils/network/atoms';
import { atom, useAtom, useAtomValue } from 'jotai';
import { verifyPassword } from '@/api/users';
import { useParamAtom } from '@/utils/hooks/useParamAtom';

/* State atoms */
const currentUsernameAtom = atom('');

/* Validation atoms */
const isValidAtom = atom({ username: true, password: true });
const errorMessageAtom = atom<string>();
const validatingAtom = atom(false);

export default function LoginPage() {
    const navigate = useNavigate();
    const { isLoading } = useAtomValue(authContextAtom);
    const { authorize } = useAtomValue(authContextActionAtom);
    const loadEndpoint = useAtomValue(loadEndpointAtom);

    /* State */
    const [currentUsername, setCurrentUsername] = useAtom(currentUsernameAtom);
    const user = useParamAtom(getUserAtom, currentUsername);

    /* Validation */
    const [isValid, setIsValid] = useAtom(isValidAtom);
    const [errMsg, setErrMsg] = useAtom(errorMessageAtom);
    const [validating, setValidating] = useAtom(validatingAtom);
    const isBusy = isLoading || loadEndpoint.isPending || validating;

    async function validateLogin(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = formData.get('username');
        const password = formData.get('password');
        setValidating(true);

        if (typeof username === 'string' && typeof password === 'string') {
            setCurrentUsername(username);

            // Validate username
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
                        onChange={(_) => {
                            if (!isValid.username) {
                                setIsValid({
                                    username: true,
                                    password: isValid.password,
                                });
                                setErrMsg(undefined);
                            }
                        }}
                    />
                    <StyledTextField
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Enter password..."
                        fullWidth
                        required
                        error={!isValid.password}
                        onChange={(_) => {
                            if (!isValid.password) {
                                setIsValid({
                                    username: isValid.username,
                                    password: true,
                                });
                                setErrMsg(undefined);
                            }
                        }}
                    />

                    <div id="login-btn">
                        <StyledButton
                            type="submit"
                            variant="contained"
                            disabled={isBusy}
                            color="primary"
                        >
                            {validating ? 'Logging in...' : 'Login'}
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
