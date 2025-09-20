<script lang="ts">
    import Column from '@/components/Column.svelte';
    import { derived } from 'svelte/store';

    let {
        value = $bindable(''),
        helperText = () => null,
        class: className = '',
        style = '',
        oninput = undefined,
        required = false,
        invalid = false,
        label = '',
        ...restProps
    } = $props();

    /** Determines if this is the first time the component is being displayed. */
    let initialDisplay = $state(true);

    /** Determines if the text field is focused/has focus. */
    let isFocused = $state(false);

    /** Determines if the label should be floated. */
    let showFloatingLabel = $derived(isFocused || value.length > 0);

    /** The actual label text. */
    const labelText = `${label}${required ? '*' : null}`;

    /** Determines if the input is invalid. */
    let invalidEntry = $derived(
        !initialDisplay && required && (invalid || value.trim() === '')
    );

    /** Determines if the helper text should be displayed. */
    let displayHelperText = $derived(isFocused || invalidEntry);
</script>

<!-- FIXME: Change style when `required` is set! -->
<!--    - Change style when `invalid` is set! -->

<Column class="container" spacing="0">
    <input
        class="text-input {className}"
        class:float={showFloatingLabel}
        class:invalid={invalidEntry}
        type="text"
        bind:value
        onfocus={() => {
            isFocused = true;
            if (initialDisplay) {
                initialDisplay = false;
            }
        }}
        onblur={() => {
            isFocused = false;
        }}
        onfocusout={() => {
            isFocused = false;
        }}
        {oninput}
        {style}
        {...restProps}
    />
    <div
        id="label"
        class:float={showFloatingLabel}
        class:invalid={invalidEntry}
    >
        {labelText}
    </div>
    <!-- {#if showFloatingLabel || invalidEntry} -->
    {#if displayHelperText}
        <div id="helper-text" class:invalid={invalidEntry}>
            {@render helperText()}
        </div>
    {/if}
    <!-- {/if} -->
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

    .text-input.invalid {
        border-color: red;
        color: red;
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

    #label.invalid {
        color: red;
    }

    #helper-text {
        position: absolute;
        font-size: 0.9em;
        font-weight: bold;
        transform: translateY(4em) translateX(1em);
        color: #777fff;
    }

    #helper-text.invalid {
        color: red;
    }
</style>
