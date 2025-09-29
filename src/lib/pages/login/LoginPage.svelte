<script lang="ts">
  import AlertBox from '@/components/AlertBox.svelte';
  import Button from '@/components/Button.svelte';
  import Column from '@/components/ui/Column.svelte';
  import Link from '@/components/Link.svelte';
  import TextField from '@/components/ui/inputs/TextField.svelte';
  import { authContextKey } from '@/auth/authContextKey';
  import { getContext } from 'svelte';
  import { getUserByUsername, verifyPassword } from '@/api/users';
  import { loadEndpoint } from '@/api/network';
  import { navContextKey } from '@/router/navContextKey';
  import { toCssString } from '@/utils/cssHelpers';
  import { type AuthContext } from '@/auth/types';
  import { type NavContext } from '@/router/types';

  const { authorize } = getContext<AuthContext>(authContextKey);
  const { navigateTo } = getContext<NavContext>(navContextKey);

  /** State of the username input. */
  let usernameState = $state({
    input: '',
    isValid: true,
  });

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

  /** Validates the login (username and password). */
  async function validateAndLogin() {
    isValidating = true;

    // Validate username
    const user = await getUserByUsername(usernameState.input);
    if (!user) {
      usernameState.isValid = false;
      isValidating = false;
      validationErrors = [...validationErrors, 'Username not found!'];
      return;
    }

    // Validate password
    const passwordVerified = await verifyPassword(user.id, passwordState.input);
    if (!passwordVerified) {
      passwordState.isValid = false;
      isValidating = false;
      validationErrors = [...validationErrors, 'Incorrect password!'];
      return;
    }

    usernameState.isValid = true;
    passwordState.isValid = true;
    validationErrors = [];

    // Authorize user
    await authorize(user);

    // Load network endpoint
    await loadEndpoint(user.id);

    // Go to dashboard
    isValidating = false;
    navigateTo('/dashboard', { replace: true });
  }

  /** Style for the validation alerts. */
  const alertStyle = toCssString({
    width: '15em',
  });

  /** Style for the entire form. */
  const formStyle = toCssString({
    justifyContent: 'center',
    alignItems: 'center',
  });
</script>

<Column spacing="2em" style={formStyle}>
  <h1 class="app-title">Spots</h1>

  <!-- Form -->
  <TextField
    label="Username"
    bind:value={usernameState.input}
    invalid={!usernameState.isValid}
    required
    oninput={() => {
      if (!usernameState.isValid) {
        usernameState.isValid = true;
        validationErrors = [];
      }
    }}
  >
    {#snippet helperText()}
      Username is required!
    {/snippet}
  </TextField>
  <TextField
    bind:value={passwordState.input}
    invalid={!passwordState.isValid}
    label="Password"
    type="password"
    required
    oninput={() => {
      if (!passwordState.isValid) {
        passwordState.isValid = true;
        validationErrors = [];
      }
    }}
  >
    {#snippet helperText()}
      Password is required!
    {/snippet}
  </TextField>
  <Button
    onclick={validateAndLogin}
    disabled={isValidating}
    style="padding: 1em 2em;"
  >
    {#if isValidating}
      Logging in...
    {:else}
      Login
    {/if}
  </Button>

  <!-- Navigate to `Sign up` -->
  <Link onclick={() => navigateTo('/signup')}>Sign up</Link>

  <!-- Error messages -->
  <AlertBox
    style="transform: translateY(22em);"
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
