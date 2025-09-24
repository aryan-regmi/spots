<script lang="ts">
  import AlertBox, { type AlertValue } from '@/components/AlertBox.svelte';
  import Column from '@/components/Column.svelte';
  import TextField from '@/components/inputs/TextField.svelte';
  import { Button } from 'bits-ui';
  import { authContextKey } from '@/auth/authContextKey';
  import { createEndpoint } from '@/api/network';
  import { getContext } from 'svelte';
  import { getUserByUsername, hashPassword, insertUser } from '@/api/users';
  import { navContextKey } from '@/router/navContextKey';
  import { passwordSchema, usernameSchema } from '@/utils/inputParsers';
  import { toCssString } from '@/utils/cssHelpers';
  import { type AuthContext } from '@/auth/types';
  import { type NavContext } from '@/router/types';

  const { authorize } = getContext<AuthContext>(authContextKey);
  const { navigateTo } = getContext<NavContext>(navContextKey);

  type ValidationError =
    | 'Username already exists!'
    | 'Passwords must match!'
    | { unknownError: string };

  let usernameInputInitialFocus = $state(true);
  let passwordInputInitialFocus = $state(true);
  let confirmPasswordInputInitialFocus = $state(true);

  let usernameInput = $state('');
  let passwordInput = $state('');
  let confirmPasswordInput = $state('');

  /** List of validation errors. */
  let validationErrors = $derived.by(() => {
    const errors: ValidationError[] = [];

    if (!usernameInputInitialFocus) {
      // Username validation
      const usernameResult = usernameSchema.safeParse(usernameInput);
      if (!usernameResult.success) {
        for (const issue of usernameResult.error.issues) {
          errors.push({ unknownError: issue.message });
        }
      }
    }

    if (!passwordInputInitialFocus) {
      // Password validation
      const passwordResult = passwordSchema.safeParse(passwordInput);
      if (!passwordResult.success) {
        for (const issue of passwordResult.error.issues) {
          errors.push({ unknownError: issue.message });
        }
      }
    }

    if (!confirmPasswordInputInitialFocus) {
      // Confirm password validation
      if (passwordInput != confirmPasswordInput) {
        errors.push('Passwords must match!');
      }
    }

    return errors;
  });

  /** Determines if the input is being validated. */
  let isValidating = $state(false);

  const isUsernameValid = $derived.by(() => {
    return usernameSchema.safeParse(usernameInput).success;
  });

  const isPasswordValid = $derived.by(() => {
    return passwordSchema.safeParse(passwordInput).success;
  });

  const isConfirmPasswordValid = $derived.by(() => {
    return confirmPasswordInput === passwordInput;
  });

  /** Deduplicated version of [validationErrors]. */
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
    if (!isUsernameValid && !usernameInputInitialFocus) {
      return toCssString({
        marginBottom: '0.8em',
      });
    }
    return '';
  });

  /** Style for the password text input. */
  const passwordInputStyle = $derived.by(() => {
    if (!isPasswordValid && !passwordInputInitialFocus) {
      return toCssString({
        marginBottom: '0.8em',
      });
    }
  });

  /** Determines if the signup button is disabled. */
  const signupDisabled = $derived.by(() => {
    return !isUsernameValid || !isPasswordValid || isValidating;
  });

  /** The alerts to display to the user (based on validation errors). */
  let alerts: AlertValue[] = $derived.by(() => {
    return uniqueErrors.map((err) => ({
      level: 'error',
      text: typeof err === 'string' ? err : err.unknownError,
    }));
  });

  /** Validates the login (username and password). */
  async function validateAndLogin() {
    // Validate inputs
    isValidating = true;
    const usernameIsValid =
      (await validateUsername(usernameInput)) && isUsernameValid;

    if (usernameIsValid && isPasswordValid) {
      // Hash password
      const hashedPassword = await hashPassword(passwordInput);

      // Save user to database
      const newUser = await insertUser(usernameInput, hashedPassword);

      // Create network endpoint
      await createEndpoint(newUser.id);

      // Authorize and redirect to dashboard
      await authorize(newUser);
      await navigateTo('/dashboard', { replace: true });
    }
    isValidating = false;
  }

  /** Validates the username input. */
  async function validateUsername(username: string) {
    if (isUsernameValid && username.length > 0) {
      const user = await getUserByUsername(username);
      if (user) {
        validationErrors.push('Username already exists!');
        return false;
      }
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
    bind:value={usernameInput}
    invalid={!isUsernameValid}
    required
    onfocus={() => {
      if (usernameInputInitialFocus) {
        usernameInputInitialFocus = false;
      }
    }}
    oninput={() => validateUsername(usernameInput)}
  >
    {#snippet helperText()}
      Enter a username...
    {/snippet}
  </TextField>
  <TextField
    style={passwordInputStyle}
    label="Password"
    type="password"
    bind:value={passwordInput}
    invalid={!isPasswordValid}
    required
    onfocus={() =>
      passwordInputInitialFocus ? (passwordInputInitialFocus = false) : null}
  >
    {#snippet helperText()}
      Enter a password...
    {/snippet}
  </TextField>
  <TextField
    label="Confirm password"
    type="password"
    bind:value={confirmPasswordInput}
    invalid={!isConfirmPasswordValid}
    required
    onfocus={() =>
      confirmPasswordInputInitialFocus
        ? (confirmPasswordInputInitialFocus = false)
        : null}
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
