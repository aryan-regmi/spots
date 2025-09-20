<script lang="ts">
    import Alert from '@/components/Alert.svelte';
    import Column from '@/components/Column.svelte';
    import TextField from '@/components/inputs/TextField.svelte';
    import type { AuthContext } from '@/auth/types';
    import type { NavContext } from '@/router/types';
    import { Button } from 'bits-ui';
    import { createEndpoint } from '@/api/network';
    import { getContext } from 'svelte';
    import { getUserByUsername, hashPassword, insertUser } from '@/api/users';
    import { toCssString } from '@/utils/cssHelpers';
    import AlertBox from '@/components/AlertBox.svelte';

    const { authorize } = getContext<AuthContext>('authContext');
    const { navigateTo } = getContext<NavContext>('navContext');

    /** State of the username input. */
    let usernameState = $state({
        input: '',
        isValid: true,
    });
    let firstEnter = $state(true);

    /** State of the password input. */
    let passwordState = $state({
        input: '',
        isValid: true,
    });

    /** Determines if the input is being validated. */
    let isValidating = $state(false);

    /** List of validation errors. */
    let validationErrors = $state<string[]>([]);

    /** Deduplicated version of [validationErrors]. */
    let uniqueErrors = $derived([...new Set(validationErrors)]);

    /** Style for the validation alerts. */
    const alertStyle = toCssString({
        width: '15em',
    });

    /** Style for the entire form. */
    const formStyle = toCssString({
        justifyContent: 'center',
        alignItems: 'center',
    });

    const usernameInputStyle = () => {
        if (usernameState.input === '' && !firstEnter) {
            return toCssString({
                marginBottom: '0.8em',
            });
        }
    };

    /** Validates the login (username and password). */
    async function validateAndLogin() {
        isValidating = true;

        // FIXME: Validate username same way as password: check for spaces, unallowed characters, etc
        //
        // Username is invalid if there is already a user in the database
        const user = await getUserByUsername(usernameState.input);
        if (user) {
            usernameState.isValid = false;
            validationErrors.push('Username already exists!');
            isValidating = false;
            return;
        }

        // Validate password
        const validatedPassword = validatePassword(passwordState.input);

        if (usernameState.isValid && validatedPassword) {
            usernameState.isValid = true;
            passwordState.isValid = true;

            // Hash password
            const hashedPassword = await hashPassword(passwordState.input);

            // Save user to database
            const newUser = await insertUser(
                usernameState.input,
                hashedPassword
            );

            // Create network endpoint
            await createEndpoint(newUser.id);

            // Authorize and redirect to dashboard
            await authorize(newUser);
            await navigateTo('/dashboard', { replace: true });
        }
        isValidating = false;
    }

    /** Validates the password input. */
    function validatePassword(password: string) {
        let validLen = password.length >= 8;
        if (!validLen) {
            isValidating = false;
            passwordState.isValid = false;
            validationErrors.push(
                'The password must be at least 8 characters long!'
            );
            return false;
        }

        let validSymbols = password.match('^(?=.*[!@#$%^*()_+=]).*$');
        if (!validSymbols || validSymbols.length == 0) {
            isValidating = false;
            passwordState.isValid = false;
            validationErrors.push(
                'The password must contain at least one symbol/special character!'
            );
            return false;
        }

        return true;
    }
</script>

<Column spacing="2em" style={formStyle}>
    <h1 class="app-title">Spots</h1>

    <!-- Form -->
    <TextField
        style={usernameInputStyle()}
        label="Username"
        bind:value={usernameState.input}
        invalid={!usernameState.isValid}
        required
        onfocus={() => {
            if (firstEnter) {
                firstEnter = false;
            }
        }}
        oninput={() => {
            if (!usernameState.isValid) {
                usernameState.isValid = true;
                validationErrors = [];
            }
        }}
    >
        {#snippet helperText()}
            Enter a username...
        {/snippet}
    </TextField>
    <TextField
        label="Password"
        type="password"
        bind:value={passwordState.input}
        invalid={!passwordState.isValid}
        required
        oninput={() => {
            if (!passwordState.isValid) {
                passwordState.isValid = true;
                validationErrors = [];
            }
        }}
    >
        {#snippet helperText()}
            Enter a password...
        {/snippet}
    </TextField>
    <Button.Root onclick={validateAndLogin}>
        {#if isValidating}
            Logging in...
        {:else}
            Sign up
        {/if}
    </Button.Root>

    <!-- Error messages -->
    <AlertBox
        style="transform: translateY(21em);"
        {alertStyle}
        alerts={uniqueErrors.map((text) => ({
            level: 'error',
            text,
        }))}
    />
</Column>

<style>
    .app-title {
        margin-bottom: 3em;
        margin-top: -1em;
        padding-top: 0;
    }
</style>
