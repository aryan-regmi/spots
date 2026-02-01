import {
  AuthenticationError,
  AuthInfo,
  AuthService,
  getAuthContext,
} from '@/auth/authService';
import { Effect, Ref } from 'effect';

// const authDataState = Effect.runSync(
//   // Load state from local storage or return new state
//   () => {
//     let authInfo: AuthInfo = { username: null };
//     const storedAuthToken = localStorage.getItem('auth-token');
//     if (storedAuthToken) {
//       authInfo.username = storedAuthToken;
//     }
//     return Ref.make(authInfo);
//   }
//   // Effect.gen(function* () {
//   // }).pipe(Effect.runSync)
// );

/** The authentication state. */
const authDataState = () => {
  let authInfo: AuthInfo = { username: null };
  const storedAuthToken = localStorage.getItem('auth-token');
  if (storedAuthToken) {
    authInfo.username = storedAuthToken;
  }
  return Ref.make(authInfo).pipe(Effect.runSync);
};

/** The loading state. */
const isLoadingState = Effect.runSync(Ref.make<boolean>(false));

/** Authenticates the specified user. */
const authenticate = (username: string, password: string) =>
  Effect.gen(function* () {
    // Set loading state
    yield* Ref.update(isLoadingState, () => true);

    // Simulate delay
    yield* Effect.promise(
      () => new Promise((resolve) => setTimeout(resolve, 2000))
    );

    // Mock backend calls
    if (username === 'user' && password === '1') {
      localStorage.setItem('auth-token', username);
      yield* Ref.update(authDataState(), () => ({ username: username }));
      yield* Ref.update(isLoadingState, () => false);
    } else {
      yield* Ref.update(isLoadingState, () => false);
      yield* Effect.fail(
        new AuthenticationError({
          message: 'Login does not exist',
        })
      );
    }
  });

/** Unauthenticates the currently authenticated user. */
const unauthenticate = Effect.gen(function* () {
  const authUser = (yield* authDataState()).username;
  if (authUser !== null) {
    yield* Ref.update(authDataState(), () => ({ username: null }));
    localStorage.removeItem('auth-token');
  }
});

/** Provides mock implementation of the `AuthService`. */
const mockAuthServiceProvider = Effect.provideService(
  getAuthContext,
  AuthService,
  {
    data: authDataState(),
    authenticate,
    unauthenticate,
    isLoading: isLoadingState,
  }
);

/** Hook to use authentication service. */
export function useAuth() {
  return Effect.runSync(mockAuthServiceProvider);
}

/** Gets the current authentication data. */
export const getAuthUser = Effect.gen(function* () {
  return yield* useAuth().data;
});
