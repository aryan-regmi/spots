import { Effect } from 'effect';

export type AuthUser = {
  username: string;
};

/** Authenticates the given user. */
export const authenticateUser = (username: string, password: string) => {
  const effect: Effect.Effect<AuthUser | null> = Effect.gen(function* () {
    yield* Effect.promise(
      () => new Promise((resolve) => setTimeout(resolve, 2000))
    );

    if (username === 'user' && password === '1') {
      let user = {
        username: username,
        hashedPassword: password,
      };
      localStorage.setItem('auth-token', user.username);
      return user;
    }

    return null;
  });
  return effect;
};
