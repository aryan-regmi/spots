import { apiCall } from '@/api/utils';
import { Logger } from '@/utils/logger';
import { action } from '@solidjs/router';

/** Registers a user. */
export const registerUserAction = action(async (formData: FormData) => {
  return registerUser(formData).match(
    (_success) => {},
    (error) => {
      Logger.error(
        `Unable to register user: ${error.message}`,
        'FRONTEND:registerUserAction'
      );
    }
  );
});

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
