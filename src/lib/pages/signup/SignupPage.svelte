<script lang="ts">
    import Column from '@/components/Column.svelte';
    import TextField from '@/components/inputs/TextField.svelte';
    import type { AuthContext } from '@/auth/types';
    import type { NavContext } from '@/router/types';
    import { Button } from 'bits-ui';
    import { createEndpoint } from '@/api/network';
    import { getContext } from 'svelte';
    import { getUserByUsername, hashPassword, insertUser } from '@/api/users';
    import { toCssString } from '@/utils/cssHelpers';
    import AlertBox, { type AlertValue } from '@/components/AlertBox.svelte';
    import { passwordSchema, usernameSchema } from '@/utils/inputParsers';

    const { authorize } = getContext<AuthContext>('authContext');
    const { navigateTo } = getContext<NavContext>('navContext');

    type ValidationErrors =
        | 'Username already exists!'
        | 'Passwords must match!'
        | { unknownError: string };

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

    /** State of the password confirmation input. */
    let confirmPasswordState = $state({
        input: '',
        isValid: true,
    });

    /** Determines if the input is being validated. */
    let isValidating = $state(false);

    /** List of validation errors. */
    let validationErrors = $state<ValidationErrors[]>([]);

    /** Deduplicated version of [validationErrors]. */
    // let uniqueErrors = $derived([...new Set(validationErrors)]);
    let uniqueErrors = $derived.by(() => {
        const seen = new Set<string>();
        return validationErrors.filter((err) => {
            const msg = typeof err === 'string' ? err : err.unknownError;
            if (seen.has(msg)) return false;
            seen.add(msg);
            return true;
        });
    });

    /** Style for the validation alerts. */
    const alertStyle = toCssString({
        width: '15em',
    });

    /** Style for the entire form. */
    const formStyle = toCssString({
        justifyContent: 'center',
        alignItems: 'center',
    });

    /** Style for the username text input. */
    const usernameInputStyle = $derived.by(() => {
        if (!usernameState.isValid && !firstEnter) {
            return toCssString({
                marginBottom: '0.8em',
            });
        }
        return '';
    });

    /** Style for the password text input. */
    const passwordInputStyle = $derived.by(() => {
        if (!passwordState.isValid && !firstEnter) {
            return toCssString({
                marginBottom: '0.8em',
            });
        }
    });

    const signupDisabled = $derived.by(() => {
        return !usernameState.isValid || !passwordState.isValid || isValidating;
    });

    let alerts: AlertValue[] = $derived.by(() => {
        return uniqueErrors.map((err) => {
            let errMsg: string = '';

            if (typeof err === 'string') {
                switch (err) {
                    case 'Username already exists!':
                    case 'Passwords must match!':
                        errMsg = err;
                }
            } else {
                errMsg = err.unknownError;
            }

            return {
                level: 'error',
                text: errMsg,
            };
        });
    });

    $effect(() => {
        if (!passwordState.isValid && passwordState.input.length >= 8) {
            // Remove matching error from validationErrors
            validationErrors = validationErrors.filter((err) => {
                return !(
                    typeof err !== 'string' &&
                    err.unknownError.trim() ===
                        'Password must be at least 8 characters long'
                );
            });

            // Mark password state as valid again
            passwordState.isValid = true;
        }
    });

    $effect(() => {
        if (
            !passwordState.isValid &&
            passwordState.input.match(/[^a-zA-Z0-9]/)
        ) {
            console.log(validationErrors);
            // Remove matching error from validationErrors
            validationErrors = validationErrors.filter((err) => {
                return !(
                    typeof err !== 'string' &&
                    err.unknownError.trim() ===
                        'Password must contain at least one special character'
                );
            });

            // Mark password state as valid again
            passwordState.isValid = true;
        }
    });

    /** Validates the login (username and password). */
    async function validateAndLogin() {
        // Validate inputs
        isValidating = true;
        const usernameIsValid = await validateUsername(usernameState.input);
        const passwordIsValid = validatePassword(passwordState.input);

        if (usernameIsValid && passwordIsValid) {
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
        const result = passwordSchema.safeParse(password);
        if (!result.success) {
            isValidating = false;
            passwordState.isValid = false;
            result.error.issues.forEach((e) =>
                validationErrors.push({ unknownError: e.message })
            );
            return false;
        }

        if (passwordState.input !== confirmPasswordState.input) {
            isValidating = false;
            confirmPasswordState.isValid = false;
            validationErrors.push('Passwords must match!');
            return false;
        }

        return true;
    }

    /** Validates the username input. */
    async function validateUsername(username: string) {
        const result = usernameSchema.safeParse(username);
        if (!result.success) {
            isValidating = false;
            usernameState.isValid = false;
            result.error.issues.forEach((e) =>
                validationErrors.push({ unknownError: e.message })
            );
            return false;
        }

        const user = await getUserByUsername(username);
        if (user) {
            isValidating = false;
            usernameState.isValid = false;
            validationErrors.push('Username already exists!');
            return false;
        }

        return true;
    }
</script>

<Column spacing="2em" style={formStyle}>
    <h1 class="app-title">Spots</h1>

    <!-- Form -->
    <TextField
        style={usernameInputStyle}
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
            validateUsername(usernameState.input);
        }}
    >
        {#snippet helperText()}
            Enter a username...
        {/snippet}
    </TextField>
    <TextField
        style={passwordInputStyle}
        label="Password"
        type="password"
        bind:value={passwordState.input}
        invalid={!passwordState.isValid}
        required
        oninput={() => {
            validatePassword(passwordState.input);
        }}
    >
        {#snippet helperText()}
            Enter a password...
        {/snippet}
    </TextField>
    <TextField
        label="Confirm password"
        type="password"
        bind:value={confirmPasswordState.input}
        invalid={!confirmPasswordState.isValid}
        required
        oninput={() => {
            if (!confirmPasswordState.isValid) {
                confirmPasswordState.isValid = true;
                validationErrors = [];
            }
        }}
    >
        {#snippet helperText()}
            Re-enter password...
        {/snippet}
    </TextField>
    <Button.Root onclick={validateAndLogin} disabled={signupDisabled}>
        {#if isValidating}
            Logging in...
        {:else}
            Sign up
        {/if}
    </Button.Root>

    <!-- Error messages -->
    <AlertBox
        style="position: relative; max-height: 15em; overflow-y: auto; padding-right: 1em;"
        {alertStyle}
        {alerts}
    />
</Column>

<style>
    .app-title {
        margin-bottom: 3em;
        margin-top: -1em;
        padding-top: 0;
    }
</style>
