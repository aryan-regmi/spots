<script lang="ts">
    import { getUserByUsernameQuery } from '@/api/users';
    import type { AuthContext } from '@/auth/types';
    import Column from '@/components/Column.svelte';
    import type { User } from '@/user/types';
    import Button from '@smui/button';
    import Card from '@smui/card';
    import Textfield from '@smui/textfield';
    import HelperText from '@smui/textfield/helper-text';
    import { getContext } from 'svelte';

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

    /** Gets the user from the database for the current username input. */
    let user: User | undefined;
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

<Column spacing="0.5em" class="login-form">
    <h1 class="app-title">Spots</h1>

    <!-- Form -->
    <Textfield
        class="login-page-input"
        variant="filled"
        bind:value={usernameInput}
        invalid={!usernameIsValid}
        label="Username"
        required
    >
        {#snippet helper()}
            <HelperText>Enter username</HelperText>
        {/snippet}
    </Textfield>
    <Textfield
        class="login-page-input"
        variant="filled"
        bind:value={passwordInput}
        invalid={!passwordIsValid}
        label="Password"
        type="password"
        required
    >
        {#snippet helper()}
            <HelperText>Enter password</HelperText>
        {/snippet}
    </Textfield>

    <Button onclick={validateAndLogin}>
        {#if isValidating}
            Logging in...
        {:else}
            Login
        {/if}
    </Button>

    <!-- Error messages -->
    <Column>
        {#each validationErrors as error}
            <Card variant="raised" class="validation-error-card">{error}</Card>
        {/each}
    </Column>
</Column>

<style>
    .app-title {
        margin-bottom: 3em;
        margin-top: -1em;
        padding-top: 0;
    }

    :global(.login-page-input.mdc-text-field--focused) {
        background-color: rgba(50, 50, 50, 1);
    }

    :global(.login-page-input .mdc-text-field__ripple) {
        display: none;
    }

    :global(.login-page-input) {
        border-radius: '0.1em';
    }

    :global(.login-form) {
        justify-content: center;
        align-items: center;
    }

    :global(.validation-error-card) {
        color: red;
    }
</style>
