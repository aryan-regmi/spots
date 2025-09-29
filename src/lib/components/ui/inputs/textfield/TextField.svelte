<script lang="ts">
  import Column from '@/components/Column.svelte';
  import type { RestProps } from '@/utils/restProps';
  import { toCssString } from '@/utils/cssHelpers';
  import { getContext } from 'svelte';
  import { themeContextKey } from '@/theme/themeContextKey';
  import type { ThemeContext } from '@/theme/types';
  import { TextFieldState } from './TextFieldState.svelte';

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
    onclick?: () => void;
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
    onclick,
    ...restProps
  }: Props = $props();

  // Gets the theme context
  const { currentPalette } = getContext<ThemeContext>(themeContextKey);
  const palette = $derived(currentPalette());

  /** The state of the text field. */
  let textFieldState = new TextFieldState({
    value,
    label,
    required,
    onfocus,
    onblur,
    onfocusout,
    onclick,
  });

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

<Column style={containerStyle} spacing="0">
  <!-- The text input -->
  <input
    class={inputStyles.class}
    style={inputStyles.style}
    type="text"
    bind:value={textFieldState.value}
    {oninput}
    onfocus={textFieldState.handleOnFocus}
    onblur={textFieldState.handleOnBlur}
    onfocusout={textFieldState.handleOnFocusOut}
    onclick={textFieldState.handleOnClick}
    {...restProps}
  />

  <!-- The floating label -->
  <div
    class="input-label"
    class:float={textFieldState.isFloated}
    style={labelStyle}
  >
    {textFieldState.labelText}
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
