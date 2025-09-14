<script lang="ts">
    import type { User } from '@/user/types';
    import { setContext } from 'svelte';
    import type { AuthContext } from './types';

    let { children } = $props();

    /** Currently authenticated user. */
    let authUser = $state<User>();

    /** Determines if the current session is authenticated. */
    const isAuthenticated = $derived(authUser !== undefined);

    /** Authenticates the specified user. */
    async function authorize(user: User) {
        authUser = user;
        console.info('User authorized: ', user);
    }

    /** Unauthenticates the specified user. */
    async function unauthorize() {
        if (authUser) {
            authUser = undefined;
            console.info('User unauthorized');
        }
    }

    // Sets the auth context to be used by other components
    setContext<AuthContext>('authContext', {
        authUser: () => authUser,
        isAuthenticated: () => isAuthenticated,
        authorize,
        unauthorize,
    });
</script>

{@render children()}
