import '@/App.css';
import Banner from '@/components/banner/Banner';
import {
    Alert,
    CircularProgress,
    IconButton,
    Stack,
    styled,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { CSSProperties, FormEvent } from 'react';
import { Form, useNavigate } from 'react-router-dom';
import { StyledButton, StyledTextField } from '@/components/form/styled';
import { atom, useAtom, useAtomValue } from 'jotai';
import { authContextActionAtom, authContextAtom } from '@/utils/auth/atoms';
import { createEndpointAtom } from '@/utils/network/atoms';
import { getUser, hashPassword } from '@/api/users';
import { insertUserAtom } from '@/utils/users/atoms';

/* Validation atoms */
const errorMessageAtom = atom<string>();
const isValidAtom = atom(true);
const validatingAtom = atom(false);

export default function SignupPage() {
    const { isLoading } = useAtomValue(authContextAtom);
    const { authorize } = useAtomValue(authContextActionAtom);
    const navigate = useNavigate();
    const insertUser = useAtomValue(insertUserAtom);
    const createEndpoint = useAtomValue(createEndpointAtom);

    /* Validation */
    const [errMsg, setErrMsg] = useAtom(errorMessageAtom);
    const [isValid, setIsValid] = useAtom(isValidAtom);
    const [validating, setValidating] = useAtom(validatingAtom);
    const isBusy =
        isLoading ||
        insertUser.isPending ||
        createEndpoint.isPending ||
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

            // Validate username
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
                await createEndpoint.mutateAsync(username);

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

    const SignupButton = (
        <>
            <div style={{ textAlign: 'center' }}>
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
            </div>{' '}
        </>
    );

    return (
        <Container direction="column">
            <IconButton
                sx={backBtnStyle}
                onClick={() => navigate('/login', { replace: true })}
                disabled={isBusy}
            >
                <ArrowBack />
            </IconButton>

            <Banner />

            {/* Signup form */}
            <Form onSubmit={validateLogin}>
                <Stack spacing="1em" direction="column">
                    <StyledTextField
                        label="Username"
                        name="username"
                        type="text"
                        placeholder="Enter a username..."
                        fullWidth
                        required
                        error={!isValid}
                        onChange={(_) => {
                            if (!isValid) {
                                setIsValid(true);
                                setErrMsg(undefined);
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
                    />

                    {SignupButton}
                </Stack>
            </Form>

            {/* Error alerts */}
            {errMsg ? (
                <Alert severity="error" variant="filled">
                    {errMsg}
                </Alert>
            ) : null}
        </Container>
    );
}

const backBtnStyle: CSSProperties = {
    width: 'fit-content',
    marginBottom: '-3.5em',
    fontSize: 'large',
    color: 'white',
    marginLeft: '-0.5em',
};

const Container = styled(Stack)({
    display: 'flex',
    flex: '1 0 300px',
    margin: '10px',
    width: '100%',
    justifyContent: 'center',
    padding: '1em',
    paddingTop: '1.75em',
    gap: '5em',
});
