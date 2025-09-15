<script lang="ts">
    import Textfield from '@smui/textfield';
    import HelperText from '@smui/textfield/helper-text';

    let usernameInput = $state({ username: '', isValid: false });
</script>

<!-- <div class="col"> -->
<div>
    <Textfield
        variant="filled"
        bind:value={usernameInput.username}
        invalid={!usernameInput.isValid}
        label="Username"
    >
        {#snippet helper()}
            <HelperText>Enter username</HelperText>
        {/snippet}
    </Textfield>
</div>

<style>
    .row {
        display: flex;
        flex-direction: row;
        gap: 1em;
    }

    .col {
        display: flex;
        flex-direction: col;
        gap: 1em;
    }
</style>
