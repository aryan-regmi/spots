<script lang="ts">
  import Alert from '@/components/Alert.svelte';
  import Column from '@/components/Column.svelte';
  import TextField from '@/components/inputs/TextField.svelte';
  import type { AuthContext } from '@/auth/types';
  import type { NavContext } from '@/router/types';
  import type { User } from '@/user/types';
  import { Button } from 'bits-ui';
  import { getContext } from 'svelte';
  import {
    getUserByUsernameQuery,
    hashPassword,
    insertUserMutation,
  } from '@/api/users';
  import type { MutationStatus, QueryClient } from '@tanstack/svelte-query';
  import { createEndpointMutation } from '@/api/network';
  import { type Unsubscriber } from 'svelte/store';

  const { authorize } = getContext<AuthContext>('authContext');
  const { navigateTo } = getContext<NavContext>('navContext');
  const queryClient = getContext<QueryClient>('queryClient');

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

  /** The user with the [usernameInput] username. */
  let user = $state<User>();

  /** Determines if the user should be inserted. */
  let insertUserAction = $state({ insert: false, isInserting: false });

  /** The status of the [insertUserMutation]. */
  let insertUserMutationStatus = $state<MutationStatus>();

  /** ID for the inserted user. */
  let insertedUserId = $state<number>();

  /** The hashed password input. */
  let hashedPassword = $state<string>();

  /** Determines if a network endpoint should be created for the user. */
  let createEndpointAction = $state({ create: false, isCreating: false });

  /** The status of the [createEndpointMutation]. */
  let createEndpointMutationStatus = $state<MutationStatus>();

  // Gets the [user] from the database for the current username input.
  $effect(() => {
    const unsub = getUserByUsernameQuery(usernameInput).subscribe((query) => {
      if (query.isSuccess) {
        user = query.data;
      }
    });

    return () => unsub();
  });

  // Inserts the [user] into the database.
  $effect(() => {
    let unsub: Unsubscriber = () => {};

    if (insertUserAction.insert && !insertUserAction.isInserting) {
      insertUserAction.isInserting = true;

      unsub = insertUserMutation(queryClient).subscribe(async (mutation) => {
        console.log('Inserting user...');

        // Insert the user
        insertedUserId = await mutation.mutateAsync({
          username: usernameInput,
          password: hashedPassword!,
        });

        insertUserMutationStatus = mutation.status;

        // Trigger endpoint creation only if user is successfully inserted
        console.log(insertUserMutationStatus);
        console.log(mutation.status);
        if (insertUserMutationStatus === 'success') {
          console.log('User Inserted!');
          insertUserAction.isInserting = false;
          createEndpointAction.create = true;
        }
      });
    }

    return () => unsub();
  });

  // Creates an endpoint for the inserted user.
  $effect(() => {
    let unsub: Unsubscriber = () => {};

    if (
      createEndpointAction.create &&
      insertedUserId &&
      !createEndpointAction.isCreating
    ) {
      createEndpointAction.isCreating = true;

      unsub = createEndpointMutation().subscribe(async (mutation) => {
        console.log('Creating endpoint...');
        createEndpointMutationStatus = mutation.status;

        // Create the endpoint
        await mutation.mutateAsync(insertedUserId!);

        // Authorize and navigate to their dashboard after endpoint creation
        if (createEndpointMutationStatus === 'success') {
          console.log('Endpoint created!');
          createEndpointAction.isCreating = false;
          await authorize(user!);
          await navigateTo('/dashboard', { replace: true });
        }
      });
    }

    return () => unsub();
  });

  /** Validates the login (username and password). */
  async function validateAndLogin() {
    isValidating = true;

    // Username is invalid if there is already a user in the database
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
      hashedPassword = await hashPassword(passwordInput);

      // Trigger to insert user to database.
      insertUserAction.insert = true;
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
