<script lang="ts">
    import Column from '@/components/Column.svelte';

    let {
        value = $bindable(''),
        helperText = () => null,
        class: className = '',
        style = '',
        oninput = undefined,
        required = false,
        label = '',
        ...restProps
    } = $props();

    let isFocused = $state(false);
    const showFloatingLabel = $derived(isFocused || value.length > 0);

    const labelText = `${label}${required ? '*' : null}`;
</script>

<!-- FIXME: Change style when required! -->

<Column class="container" spacing="0">
    <input
        class="text-input {className}"
        class:float={showFloatingLabel}
        type="text"
        bind:value
        onfocus={() => (isFocused = true)}
        onblur={() => (isFocused = false)}
        onfocusout={() => (isFocused = false)}
        {oninput}
        {style}
        {...restProps}
    />
    <div id="label" class:float={showFloatingLabel}>{labelText}</div>
    {#if showFloatingLabel}
        <div id="helper-text">
            {@render helperText()}
        </div>
    {/if}
</Column>

<style>
    .container {
        width: 100%;
        padding: 0;
        margin: 0;
        box-sizing: border-box;
    }

    .text-input {
        width: 15em;
        padding: 1.5em 1em 0.5em 1em;
        font-size: 1em;
        border: 1px solid #333;
        border-radius: 0.5em;
        background: rgba(80, 80, 90, 0.4);
        outline: none;
    }

    .text-input.float {
        border: 1px solid #0077ff;
    }

    #label {
        position: absolute;
        transform: translateY(0.75em) translateX(1em);
        color: #999;
        font-size: 1.25em;
        pointer-events: none;
        transition:
            transform 0.2s ease,
            font-size 0.2s ease,
            top 0.2s ease;
    }

    #label.float {
        font-size: 0.9em;
        transform: translateY(-1.2em);
        color: #0077ff;
    }

    #helper-text {
        position: absolute;
        font-size: 0.9em;
        font-weight: bold;
        transform: translateY(4em) translateX(1em);
        color: #777fff;
    }
</style>
