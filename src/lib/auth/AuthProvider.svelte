<script lang="ts">
    import type { User } from '@/user/types';
    import { setContext } from 'svelte';
    import type { AuthContext } from './types';
    import { removeAuthUserMutation, setAuthUserMutation } from '@/api/auth';

    let { children, queryClient } = $props();

    /** Currently authenticated user. */
    let authUser = $state<User>();

    /** Determines if the current session is authenticated. */
    const isAuthenticated = $derived(authUser !== undefined);

    /** The action to take on [userToAuthorize]. */
    let authAction = $state<'authorize' | 'unauthorize'>(undefined);

    // Authorizes/unauthorizes a user based on the [authAction].
    $effect(() => {
        let unsubscribers = [];
        if (authAction === 'authorize' && authUser) {
            unsubscribers.push(
                setAuthUserMutation(queryClient).subscribe(
                    async ({ mutateAsync }) => mutateAsync(authUser)
                )
            );
            authAction = undefined;
            console.info('User authorized: ', authUser);
        } else if (authAction === 'unauthorize') {
            unsubscribers.push(
                removeAuthUserMutation(queryClient).subscribe(
                    async ({ mutateAsync }) => mutateAsync()
                )
            );
            authAction = undefined;
            console.info('User unauthorized');
        }

        return () => {
            unsubscribers.forEach((f) => f());
        };
    });

    /** Authenticates the specified user. */
    async function authorize(user: User) {
        authUser = user;
        authAction = 'authorize';
    }

    /** Unauthenticates the specified user. */
    async function unauthorize() {
        if (authUser) {
            authUser = undefined;
            authAction = 'unauthorize';
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
