import { Effect, Context, Data, Ref } from 'effect';

/** Authentication information. */
export type AuthInfo = {
  /** The currently authenticated user. */
  username: string | null;
};

/** Error for authentication failure */
export class AuthenticationError extends Data.TaggedError(
  'AuthenticationError'
)<{
  message: string;
}> {}

/** Service responsible for all authentication states and operations. */
export class AuthService extends Context.Tag('AuthService')<
  AuthService,
  {
    data: Ref.Ref<AuthInfo>;
    authenticate: (
      username: string,
      password: string
    ) => Effect.Effect<void, AuthenticationError>;
    unauthenticate: Effect.Effect<void, never, never>;
    isLoading: Ref.Ref<boolean>;
  }
>() {}

/** Gets the authentication context. */
export const getAuthContext = Effect.gen(function* () {
  const auth = yield* AuthService;
  return auth;
});
