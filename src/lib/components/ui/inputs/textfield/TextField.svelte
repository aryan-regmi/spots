<script lang="ts">
  import Column from '@/components/ui/Column.svelte';
  import type { RestProps } from '@/utils/restProps';
  import { toCssString } from '@/utils/cssHelpers';
  import { getContext } from 'svelte';
  import { themeContextKey } from '@/theme/themeContextKey';
  import type { ThemeContext } from '@/theme/types';
  import { TextFieldState } from './TextFieldState.svelte';

  // FIXME: Add prop for helperText style
  type Props = {
    class?: string;
    style?: string;
    value: string;
    label?: string;
    required?: boolean;
    invalid?: boolean;
    helperText?: any;
    helperTextStyle?: string;
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
    helperTextStyle,
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

  const displayHelperText = $derived(
    invalid ||
      (!textFieldState.firstRender && textFieldState.value?.trim() === '')
  );

  // Keep prop `value` and `textFieldState` in sync
  $effect(() => {
    if (value !== textFieldState.value) {
      value = textFieldState.value ?? '';
    }
  });

  // Styles
  // --------------------------

  const containerStyle = toCssString({
    margin: 0,
    padding: 0,
    paddingBottom: '0.75em',
    width: '100%',
    boxSizing: 'border-box',
  });

  const inputStyles = $derived({
    class: `text-input ${className}`,
    style: toCssString({
      backgroundColor: palette.background.surface,
      borderColor:
        invalid || displayHelperText
          ? palette.error.main
          : palette.border.strong,
    }),
  });

  const labelStyle = $derived(
    toCssString({
      color:
        invalid || displayHelperText
          ? palette.error.main
          : palette.text.primary,
    })
  );

  const helperTextContainerStyle = $derived(
    `color: {palette.error.main}; ${helperTextStyle}`
  );
</script>

<!--
@component

# TextField
A text input field.

## Props
* class?: string  - The CSS classes of the component.
* style?: string  - The CSS styles of the component.
* value: string   - The value of the input (**bindable**).
* label?: string  - The input lable.
* required?: boolean  - Whether or not the the input is a required one.
* invalid?: boolean   - Whether or not the value is valid.
* helperText?: any  - Text to display when the input is invalid.
* helperTextStyle?: string  - The CSS styles of the [helperText] container.
-->
<Column style={containerStyle} spacing="0">
  <!-- The text input -->
  <input
    type="text"
    bind:value={textFieldState.value}
    class={inputStyles.class}
    style={inputStyles.style}
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

  <!-- The helper text -->
  {#if displayHelperText}
    <div class="helper-text" style={helperTextContainerStyle}>
      {@render helperText()}
    </div>
  {/if}
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
    transform: translateX(0.25em) translateY(-1.25em);
  }

  .helper-text {
    transform: translateX(0.5em);
    justify-content: left;
    text-align: left;
    padding-top: 0.2em;
  }
</style>
