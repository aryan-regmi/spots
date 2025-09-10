import Banner from '@/components/banner/Banner';
import Container from '@/components/Container';
import useTransitionNavigate from '@/utils/hooks/useTransitionNavigate';
import {
    Alert,
    CircularProgress,
    IconButton,
    Stack,
    styled,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { CSSProperties, FormEvent, useEffect, useMemo, useState } from 'react';
import { Form } from 'react-router-dom';
import { StyledButton, StyledTextField } from '@/components/form/styled';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { authContextActionAtom, authContextAtom } from '@/utils/auth/atoms';
import { createEndpointAtom } from '@/utils/network/atoms';
import { hashPassword } from '@/api/users';
import { getUserAtom, insertUserAtom } from '@/utils/users/atoms';

/** Determines if this is the user's first time logging in. */
export const isFirstLoginAtom = atom(false);

export default function SignupPage() {
    const transitionNavigate = useTransitionNavigate();
    const { isLoading } = useAtomValue(authContextAtom);
    const { authorize } = useAtomValue(authContextActionAtom);
    const insertUser = useAtomValue(insertUserAtom);
    const createEndpoint = useAtomValue(createEndpointAtom);
    const setIsFirstLogin = useSetAtom(isFirstLoginAtom);

    // Form input states
    const [usernameInput, setUsernameInput] = useState('');
    const userAtom = useMemo(() => {
        return getUserAtom({ type: 'username', value: usernameInput });
    }, [usernameInput]);
    const user = useAtomValue(userAtom).data;

    // Validation
    const [errMsg, setErrMsg] = useState<string[]>([]);
    const [isValid, setIsValid] = useState({ username: true, password: true });
    const [isValidating, setIsValidating] = useState(false);

    const isBusy =
        isLoading ||
        insertUser.isPending ||
        createEndpoint.isPending ||
        isValidating;

    /* Reset validation on unmount */
    useEffect(() => {
        return () => {
            setIsValid({ username: true, password: true });
            setErrMsg([]);
            setIsValidating(false);
        };
    }, []);

    /** Validates the username and password, then redirects to the dashboard. */
    async function validateLoginAndRedirect(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsValidating(true);

        const formData = new FormData(e.currentTarget);
        const username = formData.get('username');
        const password = formData.get('password');

        if (typeof username === 'string' && typeof password === 'string') {
            // Username is valid if there is no entry in the database
            const validUsername = !user;
            if (!validUsername) {
                setIsValid((prev) => ({
                    username: false,
                    password: prev.password,
                }));
                setIsValidating(false);
                setErrMsg((prev) => [...prev, 'Username already exists!']);
            }

            // Password validation function
            const passwordIsValid = (password: string) => {
                let validLen = password.length >= 8;
                if (!validLen) {
                    setIsValidating(false);
                    setIsValid((prev) => ({
                        username: prev.username,
                        password: false,
                    }));
                    setErrMsg((prev) => [
                        ...prev,
                        'The password must be at least 8 characters long!',
                    ]);
                    return false;
                }

                let validSymbols = password.match('^(?=.*[!@#$%^*()_+=]).*$');
                if (!validSymbols || validSymbols.length == 0) {
                    setIsValidating(false);
                    setIsValid((prev) => ({
                        username: prev.username,
                        password: false,
                    }));
                    setErrMsg((prev) => [
                        ...prev,
                        'The password must contain at least one symbol/special character!',
                    ]);
                    return false;
                }

                return true;
            };
            const validPassword = passwordIsValid(password);

            if (validPassword && validPassword) {
                setIsValid({ username: true, password: true });
                console.info('Registered user: ', username);

                // Hash password
                const hashedPassword = await hashPassword(password);

                // Save user to database
                const userId = await insertUser.mutateAsync({
                    username,
                    password: hashedPassword,
                });

                // Authorize username
                await authorize(username);

                // Create network endpoint
                await createEndpoint.mutateAsync(userId);

                // Go to homepage
                await new Promise((resolve) => setTimeout(resolve, 500));
                setIsValidating(false);
                setIsFirstLogin(true);
                await transitionNavigate('/dashboard', { replace: true });
            }
        }
    }

    return (
        <StyledContainer direction="column">
            <IconButton
                sx={backBtnStyle}
                onClick={() => transitionNavigate('/login', { replace: true })}
                disabled={isBusy}
            >
                <ArrowBack />
            </IconButton>

            <Banner />

            {/* Signup form */}
            <Form onSubmit={validateLoginAndRedirect}>
                <Stack spacing="1em" direction="column">
                    <StyledTextField
                        label="Username"
                        name="username"
                        type="text"
                        placeholder="Enter a username..."
                        fullWidth
                        required
                        error={!isValid.username}
                        onChange={(e) => {
                            setUsernameInput(e.currentTarget.value);

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
                        placeholder="Enter a password..."
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
                            {isValidating ? 'Logging in...' : 'Sign Up'}
                        </StyledButton>
                    </div>
                    <div
                        style={{
                            textAlign: 'center',
                        }}
                    >
                        {isValidating ? <CircularProgress /> : null}
                    </div>
                </Stack>
            </Form>

            {/* Error alerts */}
            <Stack gap="1em">
                {errMsg?.map((msg) => (
                    <Alert
                        severity="error"
                        variant="filled"
                        key={msg}
                        style={{ marginBottom: '4px' }}
                    >
                        {msg}
                    </Alert>
                ))}
            </Stack>
        </StyledContainer>
    );
}

const backBtnStyle: CSSProperties = {
    width: 'fit-content',
    marginBottom: '-3.5em',
    fontSize: 'large',
    color: 'white',
    marginLeft: '-0.5em',
};

const StyledContainer = styled(Container)({
    textAlign: 'center',
});
