<script lang="ts">
  import Button from '@/components/ui/Button.svelte';
  import Text from '@/components/ui/Text.svelte';
  import Column from '@/components/ui/Column.svelte';
  import TextField from '@/components/ui/inputs/textfield/TextField.svelte';
  import { authContextKey } from '@/auth/authContextKey';
  import { getContext } from 'svelte';
  import { navContextKey } from '@/router/navContextKey';
  import { toCssString } from '@/utils/cssHelpers';
  import { type AuthContext } from '@/auth/types';
  import { type NavContext } from '@/router/types';
  import { SignupPageState } from './SignupPageState.svelte';
  import type { ThemeContext } from '@/theme/types';
  import { themeContextKey } from '@/theme/themeContextKey';

  const { authorize } = getContext<AuthContext>(authContextKey);
  const { navigateTo } = getContext<NavContext>(navContextKey);
  const { currentPalette } = getContext<ThemeContext>(themeContextKey);
  const palette = $derived(currentPalette());

  let pageState = new SignupPageState();

  /** Style for the entire form. */
  const formStyle = toCssString({
    justifyContent: 'center',
    alignItems: 'center',
  });
</script>

<Column spacing="2em" style={formStyle}>
  <h1 class="app-title">Spots</h1>

  <!-- Form -->
  <form>
    <TextField
      label="Username"
      bind:value={pageState.usernameState.input}
      invalid={!pageState.usernameState.validateInput()}
      required
      onfocus={() => {
        if (pageState.usernameState.firstRender) {
          pageState.usernameState.firstRender = false;
        }
      }}
      oninput={() => pageState.usernameState.validateInput()}
    >
      {#snippet helperText()}
        <Text style="color: {palette.error.main};">
          {pageState.usernameState.errMsgs.pop()}
        </Text>
      {/snippet}
    </TextField>
    <TextField
      label="Password"
      type="password"
      bind:value={pageState.passwordState.input}
      invalid={!pageState.passwordState.validateInput()}
      required
      onfocus={() =>
        pageState.passwordState.firstRender
          ? (pageState.passwordState.firstRender = false)
          : null}
    >
      {#snippet helperText()}
        <Text style="color: {palette.error.main};">
          {pageState.passwordState.errMsgs.pop()}
        </Text>
      {/snippet}
    </TextField>
    <TextField
      label="Confirm password"
      type="password"
      bind:value={pageState.confirmPasswordState.input}
      invalid={!pageState.confirmPasswordState.validateInput()}
      required
      onfocus={() =>
        pageState.confirmPasswordState.firstRender
          ? (pageState.confirmPasswordState.firstRender = false)
          : null}
    >
      {#snippet helperText()}
        Re-enter password...
      {/snippet}
    </TextField>
    <Button
      type="submit"
      onclick={async (e) => {
        e?.preventDefault();
        await pageState.validateAndLogin(authorize, navigateTo);
      }}
      disabled={pageState.signupDisabled}
    >
      {#if pageState.isValidating}
        Logging in...
      {:else}
        Sign up
      {/if}
    </Button>
  </form>
</Column>

<style>
  .app-title {
    margin-bottom: 3em;
    margin-top: -1em;
    padding-top: 0;
  }
</style>
