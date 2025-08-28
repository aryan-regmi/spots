import '../../App.css';
import './SignupPage.css';
import Banner from '../../components/banner/Banner';
import { Button, Icon, IconButton, Stack, Typography } from '@mui/material';
import {
    ActionFunctionArgs,
    Link,
    useFetcher,
    useNavigate,
} from 'react-router-dom';
import { StyledButton, StyledTextField } from '../../common/form/styled';
import { ArrowBack } from '@mui/icons-material';
import { getUser, hashPassword, insertUser } from '../../api/users';
import useValidateAction, {
    ActionResponse,
} from '../../common/hooks/useValidateAction';
import { useState } from 'react';
import { createNewEndpoint } from '../../api/network';
import useAuth from '../../components/auth/useAuth';

export default function SignupPage() {
    const { authorize } = useAuth();
    const navigate = useNavigate();
    const fetcher = useFetcher();
    useValidateAction<ResponseData>(fetcher, onValidLogin, onInvalidLogin);
    const [isValid, setIsValid] = useState(true);

    function onValidLogin(data: ResponseData) {
        setIsValid(true);
        console.info('Registered user: ', data.username);

        // Create salt and hash password
        hashPassword(data.password).then((hash) => {
            // Save user to database
            insertUser(data.username, hash);
        });

        // Authorize username
        authorize(data.username);

        // Create network endpoint
        createNewEndpoint(data.username).then(() =>
            console.info('Network endpoint created')
        );

        // Go to homepage
        navigate('/home', { replace: true });
    }

    function onInvalidLogin(response: ActionResponse<ResponseData>) {
        setIsValid(false);
        alert(response?.error);
    }

    return (
        <Stack className="content auth-page" direction="column">
            <IconButton id="back-btn" size="large" onClick={() => navigate(-1)}>
                <ArrowBack />
            </IconButton>

            <Banner />

            {/* Signup form */}
            <fetcher.Form method="post" action="/signup">
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
                        error={!isValid}
                        onChange={(_) => (isValid ? null : setIsValid(true))}
                    ></StyledTextField>

                    <div id="signup-btn">
                        <StyledButton
                            type="submit"
                            variant="contained"
                            disabled={fetcher.state !== 'idle'}
                            color="primary"
                        >
                            {fetcher.state === 'submitting'
                                ? 'Logging in...'
                                : 'Sign Up'}
                        </StyledButton>
                    </div>
                </Stack>
            </fetcher.Form>
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
