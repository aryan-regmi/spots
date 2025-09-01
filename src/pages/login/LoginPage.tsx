import Banner from '@/components/banner/Banner';
import { Alert, CircularProgress, Stack, styled } from '@mui/material';
import { Form } from 'react-router-dom';
import { FormEvent } from 'react';
import { StyledButton, StyledTextField } from '@/components/form/styled';
import { atom, useAtom, useAtomValue } from 'jotai';
import { authContextActionAtom, authContextAtom } from '@/utils/auth/atoms';
import { getUser, verifyPassword } from '@/api/users';
import { loadEndpointAtom } from '@/utils/network/atoms';
import useTransitionNavigate from '@/utils/hooks/useTransitionNavigate';
import Container from '@/components/Container';

/* Validation atoms */
export const isValidAtom = atom({ username: true, password: true });
export const errorMessageAtom = atom<string>();
export const validatingAtom = atom(false);

export default function LoginPage() {
    const transitionNavigate = useTransitionNavigate();
    const { isLoading } = useAtomValue(authContextAtom);
    const { authorize } = useAtomValue(authContextActionAtom);
    const loadEndpoint = useAtomValue(loadEndpointAtom);

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
            const user = await getUser(username);

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
            await transitionNavigate('/dashboard', {
                replace: true,
                /* viewTransition: true, */
            });
        }
    }

    return (
        <StyledContainer direction="column">
            <Banner />

            {/* Login form */}
            <Form onSubmit={validateLogin}>
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
                        {isBusy ? <CircularProgress /> : null}
                    </div>
                </Stack>
            </Form>

            {/* Sign up link */}
            <a
                href="#"
                style={{ marginTop: '-4em' }}
                onClick={(e) => {
                    e.preventDefault();
                    transitionNavigate('/signup');
                }}
            >
                Sign Up
            </a>

            {/* Error alerts */}
            {errMsg ? (
                <Alert severity="error" variant="filled">
                    {errMsg}
                </Alert>
            ) : null}
        </StyledContainer>
    );
}

const StyledContainer = styled(Container)({
    textAlign: 'center',
    justifyContent: 'center',
});
