<script lang="ts">
  import type { User } from '@/user/types';
  import { setContext } from 'svelte';
  import type { AuthContext, AuthState } from './types';
  import { getAuthUser, removeAuthUser, setAuthUser } from '@/api/auth';

  let { children } = $props();

  /** Currently authenticated user. */
  let authState = $state<AuthState>({
    user: undefined,
    isAuthenticated: false,
  });

  // Gets the authenticated user from the database.
  $effect(() => {
    getAuthUser().then((user) => {
      user ? (authState.user = user) : null;
    });
  });

  /** Authenticates the specified user. */
  async function authorize(user: User) {
    authState.user = user;
    authState.isAuthenticated = true;
    await setAuthUser(user);
  }

  /** Unauthenticates the specified user. */
  async function unauthorize() {
    if (authState.user) {
      authState.user = undefined;
      authState.isAuthenticated = false;
      await removeAuthUser();
    }
  }

  // Sets the auth context to be used by other components
  setContext<AuthContext>('authContext', {
    authState,
    authorize,
    unauthorize,
  });
</script>

{@render children()}
