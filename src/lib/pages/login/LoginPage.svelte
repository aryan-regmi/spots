<script lang="ts">
    import { getUserByUsernameQuery } from '@/api/users';
    import type { AuthContext } from '@/auth/types';
    import Column from '@/components/Column.svelte';
    import type { User } from '@/user/types';
    import Button, { Label } from '@smui/button';
    import { Icon } from '@smui/icon-button';
    import Card from '@smui/card';
    import Textfield from '@smui/textfield';
    import HelperText from '@smui/textfield/helper-text';
    import { getContext } from 'svelte';
    import Row from '@/components/Row.svelte';
    import Snackbar from '@smui/snackbar';

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

    /** The error snackbars. */
    let errorSanckbars = $state<Snackbar[]>([]);

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

    // Opens the snackbar with the
    $effect(() => {
        errorSanckbars.forEach((bar) => (bar ? bar.open() : null));
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
        onchange={() => {
            if (!usernameIsValid) {
                usernameIsValid = true;
                validationErrors = [];
            }
        }}
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
    <Column spacing="1em" style="margin-bottom: 5em">
        {#each validationErrors as error, i}
            <Snackbar
                bind:this={errorSanckbars[i]}
                class="validation-error-card"
            >
                <Label>
                    <!-- <Row> -->
                    <Icon
                        class="material-icons"
                        style="vertical-align: middle; text-align: center; justify-content: center; align-items: center"
                        >error</Icon
                    >
                    {error}
                    <!-- </Row> -->
                </Label>
            </Snackbar>
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

    :global(.mdc-snackbar__label .mdc-snackbar) {
        color: white;
        background-color: rgba(200, 50, 50, 1);
        /* padding: 1em; */
    }
</style>
