import Banner from '@/components/banner/Banner';
import {
    Alert,
    CircularProgress,
    IconButton,
    Stack,
    styled,
} from '@mui/material';
import Glassy from '@/components/Glassy';
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
export const errorMessageAtom = atom<string>();
export const isValidAtom = atom(true);
export const validatingAtom = atom(false);

export default function SignupPage() {
    const navigate = useNavigate();
    const { isLoading } = useAtomValue(authContextAtom);
    const { authorize } = useAtomValue(authContextActionAtom);
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
                await navigate('/dashboard', {
                    replace: true,
                    viewTransition: true,
                });
            } else {
                setIsValid(false);
                setValidating(false);
                setErrMsg('Username already exists!');
            }
        }
    }

    return (
        <GlassyContainer direction="column">
            <IconButton
                sx={backBtnStyle}
                onClick={() =>
                    navigate('/login', { replace: true, viewTransition: true })
                }
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

                    {SignupButton(isBusy)}
                </Stack>
            </Form>

            {/* Error alerts */}
            {errMsg ? (
                <Alert severity="error" variant="filled">
                    {errMsg}
                </Alert>
            ) : null}
        </GlassyContainer>
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
    width: '100%',
    height: '100vh',
    display: 'flex',
    margin: 0,
    padding: '2em',
    gap: '5em',
    boxSizing: 'content-box',
    textAlign: 'center',
});

function SignupButton(isBusy: boolean) {
    return (
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
}

const GlassyContainer = Glassy(Container);
