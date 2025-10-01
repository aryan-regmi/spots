<script lang="ts">
  import Button from '@/components/ui/Button.svelte';
  import Column from '@/components/ui/Column.svelte';
  import Text from '@/components/ui/Text.svelte';
  import TextField from '@/components/ui/inputs/textfield/TextField.svelte';
  import type { ThemeContext } from '@/theme/types';
  import { authContextKey } from '@/auth/authContextKey';
  import { createEndpoint } from '@/api/network';
  import { getContext } from 'svelte';
  import { getUserByUsername, hashPassword, insertUser } from '@/api/users';
  import { navContextKey } from '@/router/navContextKey';
  import { passwordSchema, usernameSchema } from '@/utils/inputParsers';
  import { themeContextKey } from '@/theme/themeContextKey';
  import { toCssString } from '@/utils/cssHelpers';
  import { type AuthContext } from '@/auth/types';
  import { type NavContext } from '@/router/types';

  const { authorize } = getContext<AuthContext>(authContextKey);
  const { navigateTo } = getContext<NavContext>(navContextKey);
  const { currentPalette } = getContext<ThemeContext>(themeContextKey);
  const palette = $derived(currentPalette());

  // FIXME: Separate server and client validations

  class InputState {
    value = $state('');
    errMsgs = $state<string[]>([]);
    firstRender = $state(true);
    isValid = $state(true);
  }

  /** State of the username input. */
  let username = new InputState();

  /** State of the password input. */
  let password = new InputState();

  /** State of the confirm password input. */
  let confirmPassword = new InputState();

  /** Determines if the input is being validated. */
  let isValidating = $state(false);

  /** Determines if the signup button is disabled. */
  let signupDisabled = $derived.by(() => {
    return (
      !username.isValid ||
      !password.isValid ||
      !confirmPassword.isValid ||
      isValidating
    );
  });

  /** Validates the username. */
  async function validateUsername() {
    isValidating = true;

    // Validate the schema
    let validationResult = usernameSchema.safeParse(username.value);
    if (!validationResult.success) {
      for (const issue of validationResult.error.issues) {
        username.errMsgs = [...username.errMsgs, issue.message];
      }
      isValidating = false;
      return false;
    }

    // Validate the username in the server
    if (validationResult.success && username.value.length > 0) {
      const user = await getUserByUsername(username.value);
      if (user) {
        username.errMsgs = [...username.errMsgs, 'Username already exists!'];
        isValidating = false;
        return false;
      } else {
        return true;
      }
    }

    isValidating = false;
    return false;
  }

  /** Validates the password. */
  async function validatePassword() {
    isValidating = true;

    // Validate the schema
    const validationResult = passwordSchema.safeParse(password.value);
    if (!validationResult.success) {
      for (const issue of validationResult.error.issues) {
        password.errMsgs = [...password.errMsgs, issue.message];
      }
      isValidating = false;
      return false;
    }

    isValidating = false;
    return validationResult.success;
  }

  /** Validates the confirm-password. */
  async function validateConfirmPassword() {
    isValidating = true;
    let matches = confirmPassword.value === password.value;
    isValidating = false;
    return matches;
  }

  /** Validates the login (username and password). */
  async function validateAndLogin() {
    isValidating = true;
    const usernameIsValid = await validateUsername();
    const passwordIsValid = await validatePassword();
    const confirmPasswordIsValid = await validateConfirmPassword();
    if (usernameIsValid && passwordIsValid && confirmPasswordIsValid) {
      // Hash password
      const hashedPassword = await hashPassword(password.value);

      // Save user to database
      const newUser = await insertUser(username.value, hashedPassword);

      // Create network endpoint
      await createEndpoint(newUser.id);

      // Authorize and redirect to dashboard
      await authorize(newUser);
      navigateTo('/dashboard', { replace: true });
    }
    isValidating = false;
  }

  /** Style for the entire form. */
  const formStyle = toCssString({
    justifyContent: 'center',
    alignItems: 'center',
  });
</script>

<Column spacing="1em" style={formStyle}>
  <h1 class="app-title">Spots</h1>

  <TextField
    label="Username"
    bind:value={username.value}
    invalid={!username.isValid}
    required
    onfocus={() => {
      if (username.firstRender) {
        username.firstRender = false;
      }
    }}
    oninput={validateUsername}
  >
    {#snippet helperText()}
      <Text style="color: {palette.error.main};">
        {#if username.errMsgs.length > 0}
          {username.errMsgs[-1]}
        {:else}
          Username is required!
        {/if}
      </Text>
    {/snippet}
  </TextField>
  <TextField
    label="Password"
    type="password"
    bind:value={password.value}
    invalid={!password.isValid}
    required
    onfocus={() =>
      password.firstRender ? (password.firstRender = false) : null}
  >
    {#snippet helperText()}
      <Text style="color: {palette.error.main};">
        {#if password.errMsgs.length > 0}
          {password.errMsgs[-1]}
        {:else}
          Password is required!
        {/if}
      </Text>
    {/snippet}
  </TextField>
  <TextField
    label="Confirm password"
    type="password"
    bind:value={confirmPassword.value}
    invalid={!confirmPassword.isValid}
    required
    onfocus={() =>
      confirmPassword.firstRender
        ? (confirmPassword.firstRender = false)
        : null}
  >
    {#snippet helperText()}
      {#if confirmPassword.errMsgs.length > 0}
        {confirmPassword.errMsgs[-1]}
      {:else}
        Passwords must match!
      {/if}
    {/snippet}
  </TextField>
  <Button
    type="submit"
    onclick={async (e) => {
      e?.preventDefault();
      await validateAndLogin();
    }}
    disabled={signupDisabled}
  >
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
