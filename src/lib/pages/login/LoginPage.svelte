<script lang="ts">
    import { getUserByUsernameQuery } from '@/api/users';
    import type { AuthContext } from '@/auth/types';
    import Column from '@/components/Column.svelte';
    import Row from '@/components/Row.svelte';
    import type { User } from '@/user/types';
    import { getContext } from 'svelte';
    import TextField from '@/components/inputs/TextField.svelte';
    import { Button } from 'bits-ui';

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
        onchange={() => {
            if (!usernameIsValid) {
                usernameIsValid = true;
                validationErrors = [];
            }
        }}
        variant="filled"
        required
    >
        {#snippet helperText()}
            Enter username
            <!-- <Typography>Enter username</Typography> -->
        {/snippet}
    </TextField>
    <TextField
        class="login-page-input"
        variant="filled"
        bind:value={passwordInput}
        invalid={!passwordIsValid}
        label="Password"
        type="password"
        required
    >
        {#snippet helperText()}
            Enter password
        {/snippet}
    </TextField>

    <Button.Root onclick={validateAndLogin}>
        {#if isValidating}
            Logging in...
        {:else}
            Login
        {/if}
    </Button.Root>

    <!-- Error messages -->
    <Column spacing="1em" style="margin-bottom: 5em">
        {#each validationErrors as error, i}
            <!-- <Alert class="validation-error-card"> -->
            <!--     <Row> -->
            <!--         <Icon -->
            <!--             class="material-icons" -->
            <!--             style="vertical-align: middle; text-align: center; justify-content: center; align-items: center" -->
            <!--             >error</Icon -->
            <!--         > -->
            <!--         {error} -->
            <!--     </Row> -->
            <!-- </Alert> -->
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
</style>
