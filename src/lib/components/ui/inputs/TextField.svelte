<script lang="ts">
  import Column from '@/components/Column.svelte';
  import type { RestProps } from '@/utils/restProps';
  import { toCssString } from '@/utils/cssHelpers';
  import { getContext } from 'svelte';
  import { themeContextKey } from '@/theme/themeContextKey';
  import type { ThemeContext } from '@/theme/types';
  import { derived } from 'svelte/store';

  type Props = {
    class?: string;
    style?: string;
    value: string;
    label?: string;
    required?: boolean;
    invalid?: boolean;
    helperText?: () => void;
    oninput?: () => void;
    onfocus?: () => void;
    onblur?: () => void;
    onfocusout?: () => void;
  } & RestProps;
  let {
    class: className,
    style,
    value = $bindable(''),
    label,
    required,
    invalid,
    helperText,
    oninput,
    onfocus,
    onblur,
    onfocusout,
    ...restProps
  }: Props = $props();

  // Gets the theme context
  const { currentPalette } = getContext<ThemeContext>(themeContextKey);
  const palette = $derived(currentPalette());

  /** The label text. */
  const labelText = `${label}${required ? '*' : ''}`;

  /** Determines if the input has focus. */
  let isFocused = $state(false);

  /** Determines if the label is floating. */
  const isFloated = $derived(isFocused || value.length > 0);

  function handleOnFocus() {
    isFocused = true;
    onfocus?.();
  }

  function handleOnBlur() {
    isFocused = false;
    onblur?.();
  }

  function handleOnFocusOut() {
    isFocused = false;
    onfocusout?.();
  }

  // Styles
  // --------------------------

  const containerStyle = toCssString({
    margin: 0,
    padding: 0,
    width: '100%',
    boxSizing: 'border-box',
  });

  const inputStyles = $derived({
    class: `text-input ${className}`,
    style: toCssString({
      backgroundColor: palette.background.surface,
      borderColor: invalid ? palette.error.main : palette.border.strong,
    }),
  });

  const labelStyle = $derived(
    toCssString({
      color: invalid ? palette.error.main : palette.text.primary,
    })
  );
</script>

<Column class={containerStyle} spacing="0">
  <!-- The text input -->
  <input
    class={inputStyles.class}
    style={inputStyles.style}
    type="text"
    bind:value
    {oninput}
    onfocus={handleOnFocus}
    onblur={handleOnBlur}
    onfocusout={handleOnFocusOut}
    {...restProps}
  />

  <!-- The floating label -->
  <div class="input-label" class:float={isFloated} style={labelStyle}>
    {labelText}
  </div>
</Column>

<style>
  .text-input {
    width: 15em;
    padding: 1em;
    font-size: 1em;
    border: 1px solid;
    border-radius: 0.5em;
  }

  .text-input:focus {
    outline: none;
  }

  .input-label {
    position: absolute;
    transform: translateX(1em) translateY(0.75em);
    font-size: 1.25em;
    pointer-events: none;
    transition:
      transform 0.2s ease,
      font-size 0.2s ease,
      top 0.2s ease;
  }

  .input-label.float {
    font-size: 0.9em;
    font-weight: bold;
    transform: translateY(-1.25em);
  }
</style>
