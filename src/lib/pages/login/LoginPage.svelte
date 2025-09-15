<script lang="ts">
    import Column from '@/components/Column.svelte';
    import Button from '@smui/button';
    import Textfield from '@smui/textfield';
    import HelperText from '@smui/textfield/helper-text';

    let username = $state('');
    let password = $state('');

    let usernameInput = $derived({ username, isValid: true });
    let passwordInput = $derived({ password, isValid: true });
</script>

<Column spacing="0.5em" class="login-form">
    <h1 class="app-title">Spots</h1>

    <Textfield
        class="login-page-input"
        variant="filled"
        bind:value={username}
        invalid={!usernameInput.isValid}
        label="Username"
        required
    >
        {#snippet helper()}
            <HelperText>Enter username</HelperText>
        {/snippet}
    </Textfield>

    <Textfield
        class="login-page-input"
        variant="filled"
        bind:value={password}
        invalid={!passwordInput.isValid}
        label="Password"
        type="password"
        required
    >
        {#snippet helper()}
            <HelperText>Enter password</HelperText>
        {/snippet}
    </Textfield>

    <Button>Login</Button>
</Column>

<style>
    .app-title {
        margin-bottom: 3em;
        margin-top: -1em;
        padding-top: 0;
    }

    :global(.login-page-input.mdc-text-field--focused) {
        background-color: rgba(50, 50, 50, 1);
    }

    :global(.login-page-input .mdc-text-field__ripple) {
        display: none;
    }

    :global(.login-page-input) {
        border-radius: '0.1em';
    }

    :global(.login-form) {
        justify-content: center;
        align-items: center;
    }
</style>
