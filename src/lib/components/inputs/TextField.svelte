<script lang="ts">
    import Column from '@/components/Column.svelte';
    import { slide } from 'svelte/transition';

    let {
        value = $bindable(''),
        helperText = () => null,
        class: className = '',
        style = '',
        onchange = undefined,
        required = false,
        label = '',
        ...restProps
    } = $props();

    let isFocused = $state(false);
    let floatLabel = $derived(isFocused || value.length !== 0);
    const labelText = required ? `${label}*` : label;

    const inputClass = $derived(floatLabel ? 'text-input-float' : 'text-input');
</script>

<!-- placeholder={isFocused ? null : labelText} -->
<Column class="container" spacing="0">
    <input
        type="text"
        class="{inputClass} {className}"
        bind:value
        placeholder={labelText}
        onfocusin={() => (isFocused = true)}
        onfocusout={() => (isFocused = false)}
        {onchange}
        {style}
        {...restProps}
    />
    {#if floatLabel}
        <div
            class="label-text"
            in:slide={{ duration: 500 }}
            out:slide={{ duration: 100 }}
        >
            {labelText}
            <!-- {@render helperText()} -->
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

    .text-input,
    .text-input-float {
        width: 20em;
        height: 3em;
        padding: 0 1.5em;
        padding-top: 1em;
        padding-bottom: 1em;
        border-radius: 0.8em;
        border: 1px solid black;
        background-color: rgba(80, 80, 90, 0.4);
    }

    .text-input-float {
        line-height: 3em;
        padding-top: 2em;
        padding-bottom: 0;
    }

    .text-input:focus,
    .text-input-float:focus {
        border: 1px solid black;
        outline: none;
        line-height: 3em;
        padding-top: 2em;
        padding-bottom: 0;
    }

    .text-input::placeholder {
        font-size: 1.5em;
    }

    input::placeholder {
        transition: opacity 0.5s ease-out;
    }

    input:focus::placeholder {
        opacity: 0;
        position: relative;
        left: -1em;
        top: -2em;
        font-size: 1em;
    }

    .label-text {
        padding: 0;
        margin: 0;
        padding-top: 0.5em;
        padding-left: 0.5em;
        position: absolute;
        font-size: 1em;
        color: darkgray;
    }
</style>
