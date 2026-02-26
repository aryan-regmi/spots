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

/** Represents an error in the API endpoint. */
export type ApiError =
  | { kind: 'EmptyPassword'; message: string }
  | { kind: 'MaxPasswordLengthExceeded'; maxLength: number }
  | { kind: 'PasswordHashError'; message: string }
  | { kind: 'EmptyUserId'; message: string }
  | { kind: 'AuthTokenParseError'; message: string; tokenStr: string }
  | { kind: 'AuthTokenEncryptError'; message: string; token: Token }
  | { kind: 'AuthTokenSerializeError'; message: string; token: Token }
  | { kind: 'AuthTokenDecryptError'; message: string; tokenStr: string }
  | {
    kind: 'AuthTokenDecodeError';
    message: string;
    base64EncodedToken: string;
  }
  | { kind: 'ValidationError'; message: string }
  | { kind: 'DatabaseError'; message: string; database: string }
  | { kind: 'InvalidLoginCredentials'; message: string };
