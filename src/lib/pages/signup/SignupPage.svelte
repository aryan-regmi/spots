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
  import ValidationMessageList from '@/components/ui/inputs/ValidationMessageList.svelte';

  const { authorize } = getContext<AuthContext>(authContextKey);
  const { navigateTo, navigateBack } = getContext<NavContext>(navContextKey);
  const { currentPalette } = getContext<ThemeContext>(themeContextKey);
  const palette = $derived(currentPalette());

  // FIXME: Add `Back` button!

  type Input = {
    value: string;
    errMsgs: Set<string>;
    firstRender: boolean;
    isValid: boolean;
  };

  /** State of the username input. */
  let username = $state<Input>({
    value: '',
    errMsgs: new Set([]),
    firstRender: true,
    isValid: true,
  });

  /** State of the password input. */
  let password = $state<Input>({
    value: '',
    errMsgs: new Set([]),
    firstRender: true,
    isValid: true,
  });

  /** State of the confirm password input. */
  let confirmPassword = $state<Input>({
    value: '',
    errMsgs: new Set([]),
    firstRender: true,
    isValid: true,
  });

  /** Determines if the input is being validated. */
  let isValidating = $state(false);

  /** Determines if the signup button is disabled. */
  let signupDisabled = $derived.by(() => {
    return (
      !username.isValid ||
      username.value.length === 0 ||
      !password.isValid ||
      password.value.length === 0 ||
      !confirmPassword.isValid ||
      confirmPassword.value.length === 0 ||
      isValidating
    );
  });

  /** Validates the username against the Zod schema. */
  async function validateUsernameClientSide() {
    isValidating = true;
    username.errMsgs.clear();

    // Validate the schema
    let validationResult = usernameSchema.safeParse(username.value);
    if (!validationResult.success) {
      for (const issue of validationResult.error.issues) {
        username.errMsgs = new Set([...username.errMsgs, issue.message]);
      }
      isValidating = false;
      username.isValid = false;
      return false;
    }

    // Username is valid if it matches the [usernameSchema]
    isValidating = false;
    username.isValid = true;
    username.errMsgs.clear();
    return true;
  }

  /** Checks if the username already exists in the database. */
  async function validateUsernameServerSide() {
    isValidating = true;

    // Validate the username in the server
    if (username.isValid && username.value.length > 0) {
      const user = await getUserByUsername(username.value);

      // Error if username exists
      if (user) {
        username.errMsgs = new Set([
          ...username.errMsgs,
          'Username already exists!',
        ]);
        isValidating = false;
        username.isValid = false;
        return false;
      }

      // Username is valid if it doesnt exist in the database
      isValidating = false;
      username.isValid = true;
      username.errMsgs.clear();
      return true;
    }

    isValidating = false;
    username.isValid = false;
    return false;
  }

  /** Validates the password. */
  async function validatePassword() {
    isValidating = true;
    password.errMsgs.clear();

    // Validate the schema
    const validationResult = passwordSchema.safeParse(password.value);
    if (!validationResult.success) {
      for (const issue of validationResult.error.issues) {
        password.errMsgs = new Set([...password.errMsgs, issue.message]);
      }
      password = { ...password };
      password.isValid = false;
      isValidating = false;
      return false;
    }

    isValidating = false;
    password.isValid = true;
    password.errMsgs.clear();
    return validationResult.success;
  }

  /** Validates the confirm-password. */
  async function validateConfirmPassword() {
    isValidating = true;
    if (confirmPassword.value === password.value) {
      isValidating = false;
      confirmPassword.isValid = true;
      return true;
    }

    // Passwords dont match
    isValidating = false;
    confirmPassword.isValid = false;
    return false;
  }

  /** Validates the login (username and password). */
  async function validateAndLogin() {
    isValidating = true;
    const usernameIsValid =
      (await validateUsernameClientSide()) &&
      (await validateUsernameServerSide());
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

  const helperTextStyle = toCssString({
    width: '15em',
  });

  const backButtonStyle = toCssString({
    margin: 0,
    translate: '-7em -5em',
  });
</script>

<Column spacing="1em" style={formStyle}>
  <!-- FIXME: Make an icon button! -->
  <Button style={backButtonStyle} onclick={() => navigateBack()}>Back</Button>

  <h1 class="app-title">Spots</h1>

  <!-- TODO: No bullet point when only one error message! -->

  <TextField
    label="Username"
    bind:value={username.value}
    invalid={!username.isValid}
    required
    {helperTextStyle}
    onfocus={() => {
      if (username.firstRender) {
        username.firstRender = false;
      }
    }}
    oninput={validateUsernameClientSide}
  >
    {#snippet helperText()}
      <ValidationMessageList
        messages={username.errMsgs.values().toArray()}
        fallback={'Username is required!'}
      />
    {/snippet}
  </TextField>

  <TextField
    label="Password"
    type="password"
    bind:value={password.value}
    invalid={!password.isValid}
    required
    {helperTextStyle}
    onfocus={() => {
      if (password.firstRender) {
        password.firstRender = false;
      }
    }}
    oninput={validatePassword}
  >
    {#snippet helperText()}
      <ValidationMessageList
        messages={password.errMsgs.values().toArray()}
        fallback={'Password is required!'}
      />
    {/snippet}
  </TextField>

  <TextField
    label="Confirm password"
    type="password"
    bind:value={confirmPassword.value}
    invalid={!confirmPassword.isValid}
    required
    {helperTextStyle}
    onfocus={() =>
      confirmPassword.firstRender
        ? (confirmPassword.firstRender = false)
        : null}
    oninput={validateConfirmPassword}
  >
    {#snippet helperText()}
      <Text style="color: {palette.error.main};">Passwords must match!</Text>
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
    padding-top: 0;
  }
</style>
