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

  const { authorize } = getContext<AuthContext>('authContext');
  const { navigateTo } = getContext<NavContext>('navContext');

  /** Username input. */
  let usernameInput = $state('');

  /** Username input. */
  let passwordInput = $state('');

  /** Username input state. */
  let usernameIsValid = $state(true);

  /** Password input state. */
  let passwordIsValid = $state(true);

  /** Determines if the input is being validated. */
  let isValidating = $state(false);

  /** List of validation errors. */
  let validationErrors = $state<string[]>([]);

  /** Deduplicated version of [validationErrors]. */
  let uniqueErrors = $derived([...new Set(validationErrors)]);

  // FIXME: Validate username same way as password: check for spaces, unallowed characters, etc
  //
  /** Validates the login (username and password). */
  async function validateAndLogin() {
    isValidating = true;

    // Username is invalid if there is already a user in the database
    const user = await getUserByUsername(usernameInput);
    if (user) {
      usernameIsValid = false;
      validationErrors.push('Username already exists!');
      isValidating = false;
      return;
    }

    // Validate password
    const validatedPassword = validatePassword(passwordInput);

    if (usernameIsValid && validatedPassword) {
      usernameIsValid = true;
      passwordIsValid = true;

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

  /** Validates the password input. */
  function validatePassword(password: string) {
    let validLen = password.length >= 8;
    if (!validLen) {
      isValidating = false;
      passwordIsValid = false;
      validationErrors.push('The password must be at least 8 characters long!');
      return false;
    }

    let validSymbols = password.match('^(?=.*[!@#$%^*()_+=]).*$');
    if (!validSymbols || validSymbols.length == 0) {
      isValidating = false;
      passwordIsValid = false;
      validationErrors.push(
        'The password must contain at least one symbol/special character!'
      );
      return false;
    }

    return true;
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
    required
  />
  <TextField
    class="login-page-input"
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
      Sign up
    {/if}
  </Button.Root>

  <!-- Error messages -->
  <Column spacing="1em" style="margin-bottom: 5em">
    {#each uniqueErrors as error, i}
      <Alert
        class="login-error-alert"
        level="error"
        style="transform: translateX(-9em) translateY({i * 3.5}em);"
        >{error}</Alert
      >
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
    position: absolute;
    width: 15em;
  }
</style>
