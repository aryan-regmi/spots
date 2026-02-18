import { apiCall } from '@/api/utils';
import { action, redirect } from '@solidjs/router';
import { LoginUserResponseDto } from './dtos';

/** Registers a user. */
export const registerUserAction = action(async (formData: FormData) => {
  return registerUser(formData).andThen((_) => {
    // Create new login form data
    let loginFormData = formData;
    loginFormData.delete('passwordConfirm');

    // Log the user in and redirect
    return loginUser(loginFormData);
  });
}, 'registerUser');

/** Logs the user in. */
export const loginUserAction = action(async (formData: FormData) => {
  return loginUser(formData);
}, 'loginUser');

/** Makes the API request to register a new user. */
function registerUser(formData: FormData) {
  // Extract form data
  const username = formData.get('username')?.toString();
  const password = formData.get('password')?.toString();
  const passwordConfirm = formData.get('passwordConfirm')?.toString();

  // Makes the API request
  const makeRequest = apiCall('/auth/register', {
    method: 'post',
    body: JSON.stringify({ username, password, passwordConfirm }),
    cache: 'no-cache',
  });

  return makeRequest;
}

/** Makes the API request to log a user in. */
function loginUser(formData: FormData) {
  // Extract form data
  const username = formData.get('username')?.toString();
  const password = formData.get('password')?.toString();

  // Makes the API request
  const makeRequest = apiCall('/auth/login', {
    method: 'post',
    body: JSON.stringify({ username, password }),
    cache: 'no-cache',
  });

  // Gets the JWT from the request
  const getJwt = (response: Response) =>
    response.json() as Promise<LoginUserResponseDto>;

  // Sets the cookie and redirects to the dashboard
  const handleResponse = (body: LoginUserResponseDto) => {
    cookieStore.set('auth-token', body.token);
    redirect(`/user/${body.user.id}/dashboard`);
  };

  return makeRequest.map(getJwt).map(handleResponse);
}
