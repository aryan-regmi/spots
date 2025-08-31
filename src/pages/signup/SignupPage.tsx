import '@/App.css';
import '@/pages/signup/SignupPage.css';
import Banner from '@/components/banner/Banner';
import useAuth from '@/components/auth/useAuth';
import useCreateNewEndpoint from '@/utils/hooks/network/useCreateNewEndpoint';
import useInsertUser from '@/utils/hooks/users/useInsertUser';
import { Alert, CircularProgress, IconButton, Stack } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Form, useNavigate } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { StyledButton, StyledTextField } from '@/utils/form/styled';
import { getUser, hashPassword } from '@/api/users';
import { authContextAtom } from '@/components/auth/Auth';
import { useAtom, useAtomValue } from 'jotai';

export default function SignupPage() {
    const { authorize, isLoading } = useAtomValue(authContextAtom);
    /* let { authorize, isLoading } = useAuth(); */
    const navigate = useNavigate();
    const insertUser = useInsertUser();
    const createNewEndpoint = useCreateNewEndpoint();

    const [errMsg, setErrMsg] = useState<string>();
    const [isValid, setIsValid] = useState(true);
    const [validating, setValidating] = useState(false);
    const isBusy =
        isLoading ||
        insertUser.isPending ||
        createNewEndpoint.isPending ||
        validating;

    /* TODO: Add password validation also! */
    async function validateLogin(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = formData.get('username');
        const password = formData.get('password');
        setValidating(true);

        if (typeof username === 'string' && typeof password === 'string') {
            const user = await getUser(username);
            if (!user) {
                setIsValid(true);
                console.info('Registered user: ', username);

                // Hash password
                const hashedPassword = await hashPassword(password);

                // Save user to database
                await insertUser.mutateAsync({
                    username,
                    password: hashedPassword,
                });

                // Authorize username
                await authorize(username);

                // Create network endpoint
                await createNewEndpoint.mutateAsync(username);

                // Go to homepage
                setValidating(false);
                await navigate('/', { replace: true });
            } else {
                setIsValid(false);
                setValidating(false);
                setErrMsg('Username already exists!');
            }
        }
    }

    return (
        <Stack className="content auth-page" direction="column">
            <IconButton
                id="back-btn"
                size="large"
                onClick={() => navigate('/login', { replace: true })}
                disabled={isBusy}
            >
                <ArrowBack />
            </IconButton>

            <Banner />

            {/* Signup form */}
            <Form onSubmit={validateLogin}>
                <Stack className="form-content" direction="column">
                    <StyledTextField
                        label="Username"
                        name="username"
                        type="text"
                        placeholder="Enter a username..."
                        fullWidth
                        required
                        error={!isValid}
                        onChange={(_) => (isValid ? null : setIsValid(true))}
                    ></StyledTextField>

                    <StyledTextField
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Enter a password..."
                        fullWidth
                        required
                    ></StyledTextField>

                    <div id="signup-btn">
                        <StyledButton
                            type="submit"
                            variant="contained"
                            disabled={isBusy}
                            color="primary"
                        >
                            {isBusy ? 'Logging in...' : 'Sign Up'}
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

            {/* Error alerts */}
            {errMsg ? (
                <Alert severity="error" variant="filled">
                    {errMsg}
                </Alert>
            ) : null}
        </Stack>
    );
}
