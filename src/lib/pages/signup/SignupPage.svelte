<script lang="ts">
  import Button from '@/components/ui/Button.svelte';
  import Text from '@/components/ui/Text.svelte';
  import Column from '@/components/ui/Column.svelte';
  import TextField from '@/components/inputs/TextField.svelte';
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

  type InputState = {
    input: string;
    isValid: boolean;
    errMsgs: string[];
  };

  /** State of the username input. */
  let usernameState = $state<InputState>({
    input: '',
    isValid: true,
    errMsgs: [],
  });

  /** State of the password input. */
  let passwordState = $state<InputState>({
    input: '',
    isValid: true,
    errMsgs: [],
  });

  /** State of the confirm password input. */
  let confirmPasswordState = $state<InputState>({
    input: '',
    isValid: true,
    errMsgs: [],
  });

  let usernameInputInitialFocus = $state(true);
  let passwordInputInitialFocus = $state(true);
  let confirmPasswordInputInitialFocus = $state(true);

  let usernameInput = $state('');
  let passwordInput = $state('');
  let confirmPasswordInput = $state('');

  /** List of validation errors. */
  let validationErrors = $derived.by(() => {
    const usernameErrors: string[] = [];
    const passwordErrors: string[] = [];
    const confirmPasswordErrors: string[] = [];

    if (!usernameInputInitialFocus) {
      // Username validation
      const usernameResult = usernameSchema.safeParse(usernameInput);
      if (!usernameResult.success) {
        for (const issue of usernameResult.error.issues) {
          usernameErrors.push(issue.message);
        }
      }
    }

    if (!passwordInputInitialFocus) {
      // Password validation
      const passwordResult = passwordSchema.safeParse(passwordInput);
      if (!passwordResult.success) {
        for (const issue of passwordResult.error.issues) {
          passwordErrors.push(issue.message);
        }
      }
    }

    if (!confirmPasswordInputInitialFocus) {
      // Confirm password validation
      if (passwordInput != confirmPasswordInput) {
        confirmPasswordErrors.push('Passwords must match!');
      }
    }

    return {
      usernameErrors,
      passwordErrors,
      confirmPasswordErrors,
    };
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
    const usernameErrors = validationErrors.usernameErrors.filter((err) => {
      if (seen.has(err)) {
        return false;
      }
      seen.add(err);
      return true;
    });

    const passwordErrors = validationErrors.passwordErrors.filter((err) => {
      if (seen.has(err)) {
        return false;
      }
      seen.add(err);
      return true;
    });
    const confirmPasswordErrors = validationErrors.confirmPasswordErrors.filter(
      (err) => {
        if (seen.has(err)) {
          return false;
        }
        seen.add(err);
        return true;
      }
    );
    return {
      usernameErrors,
      passwordErrors,
      confirmPasswordErrors,
    };
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

  /** Determines if the signup button is disabled. */
  const signupDisabled = $derived.by(() => {
    return (
      !isUsernameValid ||
      !isPasswordValid ||
      isValidating ||
      passwordInput !== confirmPasswordInput
    );
  });

  /** Validates the login (username and password). */
  async function validateAndLogin() {
    // Validate inputs
    isValidating = true;
    const usernameExists =
      (await validateUsername(usernameInput)) && isUsernameValid;

    if (usernameExists && isPasswordValid) {
      // Hash password
      const hashedPassword = await hashPassword(passwordInput);

      // Save user to database
      const newUser = await insertUser(usernameInput, hashedPassword);

      // Create network endpoint
      await createEndpoint(newUser.id);

      // Authorize and redirect to dashboard
      await authorize(newUser);
      navigateTo('/dashboard', { replace: true });
    }
    isValidating = false;
  }

  /** Validates the username input. */
  async function validateUsername(username: string) {
    if (isUsernameValid && username.length > 0) {
      const user = await getUserByUsername(username);
      if (user) {
        validationErrors.usernameErrors = [
          ...validationErrors.usernameErrors,
          'Username already exists!',
        ];
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
      <!-- <div style="display: flex; flex-direction: row; flex-wrap: wrap;"> -->
      <!-- <Text> -->
      {validationErrors.usernameErrors.pop()}
      <!-- </Text> -->
      <!-- </div> -->
    {/snippet}
  </TextField>
  <TextField
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
  <Button onclick={validateAndLogin} disabled={signupDisabled}>
    {#if isValidating}
      Logging in...
    {:else}
      Sign up
    {/if}
  </Button>
</Column>

<style>
  .app-title {
    margin-bottom: 3em;
    margin-top: -1em;
    padding-top: 0;
  }
</style>
