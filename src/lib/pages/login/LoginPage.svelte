<script lang="ts">
  import Alert from '@/components/Alert.svelte';
  import Column from '@/components/Column.svelte';
  import TextField from '@/components/inputs/TextField.svelte';
  import type { AuthContext } from '@/auth/types';
  import type { NavContext } from '@/router/types';
  import { Button } from 'bits-ui';
  import { getContext } from 'svelte';
  import { getUserByUsername, verifyPassword } from '@/api/users';
  import { toCssString } from '@/utils/cssHelpers';
  import AlertBox from '@/components/AlertBox.svelte';

  const { authorize } = getContext<AuthContext>('authContext');
  const { navigateTo } = getContext<NavContext>('navContext');

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

  /** Style for the validation alerts. */
  const alertStyle = toCssString({
    position: 'absolute',
    width: '15em',
  });

  /** Style for the entire form. */
  const formStyle = toCssString({
    justifyContent: 'center',
    alignItems: 'center',
  });

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

    // Authorize and redirect to dashboard
    authorize(user);
    await navigateTo('/dashboard', { replace: true });
  }
</script>

<Column spacing="2em" style={formStyle}>
  <h1 class="app-title">Spots</h1>

  <!-- Form -->
  <TextField
    class="login-page-input"
    label="Username"
    bind:value={usernameState.input}
    invalid={!usernameState.isValid}
    oninput={() => {
      if (!usernameState.isValid) {
        usernameState.isValid = true;
        validationErrors = [];
      }
    }}
    required
  />
  <TextField
    class="login-page-input"
    bind:value={passwordState.input}
    invalid={!passwordState.isValid}
    label="Password"
    type="password"
    required
  />
  <Button.Root onclick={validateAndLogin}>
    {#if isValidating}
      Logging in...
    {:else}
      Login
    {/if}
  </Button.Root>

  <!-- Navigate to `Sign up` -->
  <Button.Root
    href="#"
    onclick={async (e) => {
      e.preventDefault();
      await navigateTo('/signup');
    }}>Sign up</Button.Root
  >

  <!-- Error messages -->
  <AlertBox
    style="transform: translateY(23em);"
    alerts={uniqueErrors.map((text) => {
      return {
        level: 'error',
        text,
      };
    })}
  />
</Column>

<style>
  .app-title {
    margin-bottom: 3em;
    margin-top: -1em;
    padding-top: 0;
  }
</style>
