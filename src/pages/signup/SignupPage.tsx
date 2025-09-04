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
import { Form } from 'react-router-dom';
import { StyledButton, StyledTextField } from '@/components/form/styled';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { authContextActionAtom, authContextAtom } from '@/utils/auth/atoms';
import { createEndpointAtom } from '@/utils/network/atoms';
import { getUser, hashPassword } from '@/api/users';
import { insertUserAtom } from '@/utils/users/atoms';
import useTransitionNavigate from '@/utils/hooks/useTransitionNavigate';
import Container from '@/components/Container';

/* Global state atoms */
export const firstRunAtom = atom(false);

/* Validation atoms */
const errorMessageAtom = atom<string>();
const isValidAtom = atom(true);
const validatingAtom = atom(false);

export default function SignupPage() {
    const transitionNavigate = useTransitionNavigate();
    const { isLoading } = useAtomValue(authContextAtom);
    const { authorize } = useAtomValue(authContextActionAtom);
    const insertUser = useAtomValue(insertUserAtom);
    const createEndpoint = useAtomValue(createEndpointAtom);
    const setFirstRun = useSetAtom(firstRunAtom);

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
            const user = await getUser({ type: 'username', value: username });

            // Validate username
            if (!user) {
                setIsValid(true);
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
                setValidating(false);
                setFirstRun(true);
                await transitionNavigate('/dashboard', { replace: true });
            } else {
                setIsValid(false);
                setValidating(false);
                setErrMsg('Username already exists!');
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
