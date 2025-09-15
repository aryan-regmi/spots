<script lang="ts">
    import { getUserByUsernameQuery } from '@/api/users';
    import type { AuthContext } from '@/auth/types';
    import Column from '@/components/Column.svelte';
    import Row from '@/components/Row.svelte';
    import type { User } from '@/user/types';
    import { getContext } from 'svelte';
    import TextField from '@/components/inputs/TextField.svelte';
    import { Button } from 'bits-ui';
    import Card from '@/components/Card.svelte';
    import Alert from '@/components/Alert.svelte';
    import { derived } from 'svelte/store';

    const { authorize } = getContext<AuthContext>('authContext');

    /** Username input. */
    let usernameInput = $state('');

    /** Username input. */
    let passwordInput = $state('');

    /** Username input state. */
    let usernameIsValid = $derived(true);

    /** Password input state. */
    let passwordIsValid = $derived(true);

    /** Determines if the input is being validated. */
    let isValidating = $state(false);

    /** List of validation errors. */
    let validationErrors = $state<string[]>([]);

    /** Deduplicated version of [validationErrors]. */
    let uniqueErrors = $derived([...new Set(validationErrors)]);

    /** The user with the [usernameInput] username. */
    let user: User | undefined;

    // Gets the user from the database for the current username input.
    $effect(() => {
        let unsub = getUserByUsernameQuery(usernameInput).subscribe((query) => {
            if (query.isSuccess) {
                user = query.data;
            }
        });
        return () => {
            unsub();
        };
    });

    /** Validates the login (username and password). */
    async function validateAndLogin() {
        isValidating = true;

        // Validate username
        if (!user) {
            usernameIsValid = false;
            isValidating = false;
            validationErrors = [...validationErrors, 'Username not found!'];
            return;
        }

        authorize(user);
    }
</script>

<Column spacing="2em" class="login-form">
    <h1 class="app-title">Spots</h1>

    <!-- Form -->
    <TextField
        class="login-page-input"
        label="Username"
        bind:value={usernameInput}
        invalid={!usernameIsValid}
        oninput={() => {
            if (!usernameIsValid) {
                usernameIsValid = true;
                validationErrors = [];
            }
        }}
        variant="filled"
        required
    />
    <TextField
        class="login-page-input"
        variant="filled"
        bind:value={passwordInput}
        invalid={!passwordIsValid}
        label="Password"
        type="password"
        required
    />

    <Button.Root onclick={validateAndLogin}>
        {#if isValidating}
            Logging in...
        {:else}
            Login
        {/if}
    </Button.Root>

    <!-- Error messages -->
    <Column spacing="1em" style="margin-bottom: 5em">
        {#each uniqueErrors as error, i}
            <Alert class="login-error-alert" level="error">{error}</Alert>
        {/each}
    </Column>
</Column>

<style>
    .app-title {
        margin-bottom: 3em;
        margin-top: -1em;
        padding-top: 0;
    }

    :global(.login-form) {
        justify-content: center;
        align-items: center;
    }

    :global(.login-error-alert) {
        width: 15em;
    }
</style>
