import { AuthContext, AuthContextType } from '@/auth/AuthContext';
import { AuthenticationError } from '@/auth/AuthProvider';
import { Console, Effect, Either } from 'effect';
import { useContext } from 'solid-js';

/** Hook to use the authentication context. */
export default function useAuth() {
  const resolveAuthEffect = Effect.gen(function* () {
    const authContextResult = yield* Effect.either(getAuthContext());
    if (Either.isLeft(authContextResult)) {
      Console.error(
        `${authContextResult.left._tag}: ${authContextResult.left.message}`
      );
    } else {
      return authContextResult.right;
    }
  });
  return Effect.runSync(resolveAuthEffect);
}

/** Retrieves the auth context. */
export function getAuthContext(): Effect.Effect<
  AuthContextType,
  AuthenticationError
> {
  const authContext = useContext(AuthContext);
  if (authContext) {
    return Effect.succeed(authContext);
  } else {
    return Effect.fail(
      new AuthenticationError({
        message: '`useAuth` must be used within an `AuthProvider`',
      })
    );
  }
}
