import '../../App.css';
import './SignupPage.css';
import Banner from '../../components/banner/Banner';
import { Alert, IconButton, Stack } from '@mui/material';
import {
    ActionFunctionArgs,
    Form,
    redirect,
    useFetcher,
    useNavigate,
} from 'react-router-dom';
import { StyledButton, StyledTextField } from '../../common/form/styled';
import { ArrowBack } from '@mui/icons-material';
import { getUser, hashPassword, insertUser } from '../../api/users';
import useValidateAction, {
    ActionResponse,
} from '../../common/hooks/useValidateAction';
import { FormEvent, useEffect, useState } from 'react';
import { createNewEndpoint } from '../../api/network';
import useAuth from '../../components/auth/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Loading from '../../components/loading/Loading';

export default function SignupPage() {
    const { authorize } = useAuth();
    const navigate = useNavigate();
    const { data: user } = useQuery({ queryKey: ['getUser'] });
    const [errMsg, setErrMsg] = useState<string>();
    const queryClient = useQueryClient();
    const { isSuccess } = useMutation({
        mutationFn: createNewEndpoint,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['networkData'] }),
    });

    if (!isSuccess) {
        return <Loading />;
    }

    /* async function onValidLogin(data: ResponseData) { */
    /*     setIsValid(true); */
    /*     console.info('Registered user: ', data.username); */
    /**/
    /*     // Hash password */
    /*     const hashedPassword = await hashPassword(data.password); */
    /**/
    /*     // Save user to database */
    /*     await insertUser(data.username, hashedPassword); */
    /**/
    /*     // Authorize username */
    /*     await authorize(data.username); */
    /**/
    /*     // Create network endpoint */
    /*     await createNewEndpoint(data.username); */
    /**/
    /*     // Go to homepage */
    /*     await navigate('/home', { replace: true }); */
    /* } */

    /* function onInvalidLogin(response: ActionResponse<ResponseData>) { */
    /*     setIsValid(false); */
    /*     setErrMsg(response?.error); */
    /* } */

    async function validateLogin(e: FormEvent) {
        e.preventDefault();
        console.log('hi');
    }

    return (
        <Stack className="content auth-page" direction="column">
            <IconButton
                id="back-btn"
                size="large"
                onClick={() => navigate('/login', { replace: true })}
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
                        /* error={!isValid} */
                        /* onChange={(_) => (isValid ? null : setIsValid(true))} */
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
                            /* disabled={fetcher.state !== 'idle'} */
                            color="primary"
                        >
                            {/* {fetcher.state === 'submitting' */}
                            {/*     ? 'Logging in...' */}
                            {/*     : 'Sign Up'} */}
                        </StyledButton>
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

type ResponseData = { username: string; password: string };

export async function signupAction({
    request,
}: ActionFunctionArgs): Promise<ActionResponse<ResponseData>> {
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

    // TODO: Add more username and password validation
    //  - Check for extra characters
    //  - Check password length

    // Verify username
    const user = await getUser(username);
    if (user) {
        return {
            ok: false,
            error: 'Username already exists',
        };
    }

    return { ok: true, data: { username, password } };
}
