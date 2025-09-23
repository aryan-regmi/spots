<script lang="ts">
  import type { User } from '@/user/types';
  import { authContextKey, type AuthContext } from './types';
  import { getAuthUser, removeAuthUser, setAuthUser } from '@/api/auth';
  import { setContext } from 'svelte';

  let { children } = $props();

  /** Currently authenticated user. */
  let authUser = $state<User>();

  /** Determines if the current session is authenticated. */
  // let isAuthenticated = $derived(authUser !== undefined);
  let isAuthenticated = $state<boolean>();

  // Gets the authenticated user from the database.
  $effect.pre(() => {
    getAuthUser().then((user) => {
      if (user) {
        authUser = user;
        isAuthenticated = true;
      } else {
        isAuthenticated = false;
      }
    });
  });

  /** Authenticates the specified user. */
  async function authorize(user: User) {
    authUser = user;
    isAuthenticated = true;
    await setAuthUser(user);
  }

  /** Unauthenticates the specified user. */
  async function unauthorize() {
    if (authUser) {
      authUser = undefined;
      isAuthenticated = false;
      await removeAuthUser();
    }
  }

  // Sets the auth context to be used by other components
  setContext<AuthContext>(authContextKey, {
    authUser: () => {
      return authUser;
    },
    isAuthenticated: () => {
      return isAuthenticated;
    },
    isLoading: () => {
      return isAuthenticated === undefined;
    },
    authorize,
    unauthorize,
  });
</script>

{@render children()}
