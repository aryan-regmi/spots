<script lang="ts">
  import Column from '@/components/Column.svelte';
  import { getContext } from 'svelte';
  import { themeContextKey } from '@/theme/themeContextKey';
  import { type ThemeContext } from '@/theme/types';

  let {
    value = $bindable(''),
    helperText = () => null,
    class: className = '',
    style = '',
    oninput = undefined,
    onfocus = () => {},
    onblur = () => {},
    onfocusout = () => {},
    required = false,
    invalid = false,
    label = '',
    ...restProps
  } = $props();

  const { currentPalette } = getContext<ThemeContext>(themeContextKey);
  const palette = $derived(currentPalette());

  /** Determines if this is the first time the component is being displayed. */
  let initialDisplay = $state(true);

  /** Determines if the text field is focused/has focus. */
  let isFocused = $state(false);

  /** Determines if the label should be floated. */
  let showFloatingLabel = $derived(isFocused || value.length > 0);

  /** The actual label text. */
  const labelText = `${label}${required ? '*' : ''}`;

  /** Determines if the input is invalid. */
  let invalidEntry = $derived(
    !initialDisplay && required && (invalid || value.trim() === '')
  );

  /** Determines if the helper text should be displayed. */
  let displayHelperText = $derived(invalidEntry);
</script>

<Column class="container" spacing="0">
  <!-- The text input -->
  <input
    style:background-color={palette.background.surface}
    style:border-color={invalidEntry
      ? palette.basic.secondary
      : palette.border.strong}
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
      onfocus();
    }}
    onblur={() => {
      isFocused = false;
      onblur();
    }}
    onfocusout={() => {
      isFocused = false;
      onfocusout();
    }}
    {oninput}
    {style}
    {...restProps}
  />

  <!-- The floating label -->
  <div
    id="label"
    class:float={showFloatingLabel}
    class:invalid={invalidEntry}
    style:color={invalidEntry
      ? palette.basic.secondary
      : palette.text.secondary}
    style="color: {palette.text.secondary};"
  >
    {labelText}
  </div>

  <!-- The helper text -->
  {#if displayHelperText}
    <div id="helper-text" class:invalid={invalidEntry}>
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
    border: 1px solid;
    border-radius: 0.5em;
    outline: none;
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
    /* transform: translateY(0.3em) translateX(1em); */
    transform: translateY(-1.25em);
    font-weight: bold;
  }

  #label.invalid {
    color: red;
  }

  #helper-text {
    position: absolute;
    font-size: 0.9em;
    font-weight: bold;
    transform: translateY(4em) translateX(8em);
    color: #777fff;
  }

  #helper-text.invalid {
    color: red;
  }
</style>
