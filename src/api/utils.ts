import { Logger } from '@/utils/logger';
import { ResultAsync } from 'neverthrow';

/** Represents an API error.  */
export type ApiError = { message: string };

/** Calls the API. */
export function apiCall(
  url: string,
  options?: any
): ResultAsync<Response, ApiError> {
  return ResultAsync.fromPromise<Response, ApiError>(
    rawApiCall(`${API_BASE_URL}${url}`, options),
    (err) => ({
      message: `${err}`,
    })
  );
}

// FIXME: Make this dynamic (get from env (`vite-env.d.ts`))
//
/** The base URL for the API. */
const API_BASE_URL = 'https://localhost:8055/api/v1';

/** Fetches a response from the given url. */
async function rawApiCall(url: string, options?: any) {
  try {
    // Get auth-token
    const authToken = await cookieStore.get('auth-token');

    // Make request
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken?.value
          ? { Authorization: `Bearer ${authToken.value}` }
          : {}),
        ...options.headers,
      },
      credentials: 'include',
    });

    if (response.status === 401) {
      throw new Error('HTTPError: Session expired');
    }

    if (!response.ok) {
      const errMsg = await response.text();
      const err = { status: response.status, message: errMsg };
      throw new Error(`HTTPError: ${err}`);
    }

    return await response.json();
  } catch (e) {
    const err = e as Error;
    const errInfo = { kind: err.name, message: err.message, stack: err.stack };
    Logger.error(`${JSON.stringify(errInfo)}`);
    throw err;
  }
}
