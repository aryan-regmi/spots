import { IntoSpotsError, SpotsError } from '@/utils/errors';

/** The status of an API response. */
export type ApiResponseStatus =
  | 'Success'
  | 'Failure'
  | 'Started'
  | 'Pending'
  | 'Completed';

/** An API response. */
export type ApiResponse<T> = {
  status: ApiResponseStatus;
  value: T;
};

/** Represents an auth token. */
export type Token = {
  userId: string;
  issuedAt: number;
  expiresAt: number;
};

// FIXME: Keep ApiError in sync with backend `SpotsError`

/** Represents an error in the API endpoint. */
export type ApiError =
  | { kind: 'EmptyPassword'; message: 'The provided password was empty' }
  | {
      kind: 'MaxPasswordLengthExceeded';
      message: 'Exceeded the maximum allowed password length';
      maxLength: number;
    }
  | {
      kind: 'PasswordHashError';
      message: 'Unable to hash the password';
      error: string;
    }
  | { kind: 'EmptyUserId'; message: 'The provided user ID was empty' }
  | {
      kind: 'AuthTokenParseError';
      message: 'Unable to parse the auth token';
      tokenStr: string;
      error: string;
    }
  | {
      kind: 'AuthTokenEncryptError';
      message: 'Unable to encrypt the auth token';
      token: Token;
      error: string;
    }
  | {
      kind: 'AuthTokenSerializeError';
      message: 'Unable to serialize the auth token';
      token: Token;
      error: string;
    }
  | {
      kind: 'AuthTokenDecryptError';
      message: 'Unable to decrypt the auth token';
      tokenStr: string;
      error: string;
    }
  | {
      kind: 'AuthTokenDecodeError';
      message: 'Unable to decode base64 token';
      base64EncodedToken: string;
      error: string;
    }
  | { kind: 'ValidationError'; message: 'Validation failed'; error: string }
  | {
      kind: 'DatabaseError';
      message: 'Database error';
      database: string;
      error: string;
    }
  | {
      kind: 'InvalidLoginCredentials';
      message: 'Invalid login credentials provided';
    };

/** Converts an `ApiError` into a `SpotsError`. */
export const ApiErrorAdapter: IntoSpotsError<ApiError> = {
  into: function (self: ApiError): SpotsError {
    switch (self.kind) {
      case 'EmptyPassword':
        return { ...self, _tag: '_SpotsError' };

      case 'MaxPasswordLengthExceeded':
        return {
          ...self,
          info: { maxLength: self.maxLength },
          _tag: '_SpotsError',
        };

      case 'PasswordHashError':
        return {
          ...self,
          info: { error: self.error },
          _tag: '_SpotsError',
        };

      case 'EmptyUserId':
        return {
          ...self,
          _tag: '_SpotsError',
        };

      case 'AuthTokenParseError':
        return {
          ...self,
          info: { tokenStr: self.tokenStr, error: self.error },
          _tag: '_SpotsError',
        };

      case 'AuthTokenEncryptError':
        return {
          ...self,
          info: { token: self.token, error: self.error },
          _tag: '_SpotsError',
        };

      case 'AuthTokenSerializeError':
        return {
          ...self,
          info: { token: self.token, error: self.error },
          _tag: '_SpotsError',
        };

      case 'AuthTokenDecryptError':
        return {
          ...self,
          info: { tokenStr: self.tokenStr, error: self.error },
          _tag: '_SpotsError',
        };

      case 'AuthTokenDecodeError':
        return {
          ...self,
          info: {
            base64EncodedToken: self.base64EncodedToken,
            error: self.error,
          },
          _tag: '_SpotsError',
        };

      case 'ValidationError':
        return {
          ...self,
          info: { error: self.error },
          _tag: '_SpotsError',
        };

      case 'DatabaseError':
        return {
          ...self,
          info: { database: self.database, error: self.error },
          _tag: '_SpotsError',
        };

      case 'InvalidLoginCredentials':
        return { ...self, _tag: '_SpotsError' };
    }
  },
};
