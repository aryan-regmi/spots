import Banner from '@/components/banner/Banner';
import Container from '@/components/Container';
import useTransitionNavigate from '@/utils/hooks/useTransitionNavigate';
import { Alert, CircularProgress, Stack, styled } from '@mui/material';
import { Form } from 'react-router-dom';
import { FormEvent, useEffect, useState } from 'react';
import { StyledButton, StyledTextField } from '@/components/form/styled';
import { useAtomValue } from 'jotai';
import { authContextActionAtom, authContextAtom } from '@/utils/auth/atoms';
import { getUser, verifyPassword } from '@/api/users';
import { loadEndpointAtom } from '@/utils/network/atoms';
import { useResetFadeGlassyFallback } from '@/utils/hooks/useResetFadeGlassyFallback';

export default function LoginPage() {
    const transitionNavigate = useTransitionNavigate();
    const { isLoading } = useAtomValue(authContextAtom);
    const { authorize } = useAtomValue(authContextActionAtom);
    const loadEndpoint = useAtomValue(loadEndpointAtom);
    useResetFadeGlassyFallback();

    /* Validation */
    const [isValid, setIsValid] = useState({ username: true, password: true });
    const [errMsg, setErrMsg] = useState<string[]>([]);
    const [validating, setValidating] = useState(false);
    const isBusy = isLoading || loadEndpoint.isPending || validating;

    /* Reset validation on unmount */
    useEffect(() => {
        return () => {
            setIsValid({ username: true, password: true });
            setErrMsg([]);
            setValidating(false);
        };
    }, []);

    /** Validates the username and password, then redirects to the dashboard. */
    async function validateLoginAndRedirect(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setValidating(true);

        const formData = new FormData(e.currentTarget);
        const username = formData.get('username');
        const password = formData.get('password');

        if (typeof username === 'string' && typeof password === 'string') {
            const user = await getUser({ type: 'username', value: username });

            // Validate username
            if (!user) {
                setIsValid((prev) => ({
                    username: false,
                    password: prev.password,
                }));
                setErrMsg((prev) => [...prev, 'Username not found!']);
                setValidating(false);
                return;
            }

            // Validate password
            const verified = await verifyPassword(user.id, password);
            if (!verified) {
                setIsValid((prev) => ({
                    username: prev.username,
                    password: false,
                }));
                setErrMsg((prev) => [...prev, 'Incorrect password!']);
                setValidating(false);
                return;
            }

            setIsValid({ username: true, password: true });
            setErrMsg([]);

            // Authorize username
            await authorize(username);

            // Load network endpoint
            await loadEndpoint.mutateAsync(user.id);

            // Go to homepage
            setValidating(false);
            await transitionNavigate('/dashboard', { replace: true });
        }
    }

    return (
        <StyledContainer direction="column">
            <Banner />

            {/* Login form */}
            <Form onSubmit={validateLoginAndRedirect}>
                <Stack spacing="1em" direction="column">
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
                                setIsValid((prev) => ({
                                    username: true,
                                    password: prev.password,
                                }));
                                setErrMsg([]);
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
                                setIsValid((prev) => ({
                                    username: prev.username,
                                    password: true,
                                }));
                                setErrMsg([]);
                            }
                        }}
                    />

                    <div style={{ textAlign: 'center' }}>
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
                        {validating ? <CircularProgress /> : null}
                    </div>
                </Stack>
            </Form>

            {/* Sign up link */}
            <a
                href="#"
                style={{ marginTop: '-4em' }}
                onClick={(e) => {
                    e.preventDefault();
                    if (!validating) {
                        transitionNavigate('/signup');
                    }
                }}
            >
                Sign Up
            </a>

            {/* Error alerts */}
            <Stack gap={'1em'}>
                {errMsg.map((msg) => (
                    <Alert severity="error" variant="filled" key={msg}>
                        {msg}
                    </Alert>
                ))}
            </Stack>
        </StyledContainer>
    );
}

const StyledContainer = styled(Container)({
    textAlign: 'center',
    justifyContent: 'center',
});
