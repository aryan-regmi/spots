<script lang="ts">
  import { themeContextKey } from '@/theme/themeContextKey';
  import type { ThemeContext } from '@/theme/types';
  import { toCssString } from '@/utils/cssHelpers';
  import { getContext } from 'svelte';

  type Props = {
    children?: () => any;
    onclick?: () => void;
    disabled?: boolean;
    style?: string;
    [key: string]: any;
  };
  const { children, onclick, disabled, style, ...restProps }: Props = $props();

  const { currentPalette } = getContext<ThemeContext>(themeContextKey);
  const palette = $derived(currentPalette());

  const defaultBackgroundColor = $derived(palette.secondary.main);
  const defaultBorderColor = $derived(palette.border.strong);

  let colors = $derived.by(() => {
    if (disabled) {
      return {
        background: palette.background.surface,
        border: palette.border.light,
      };
    } else {
      return {
        background: defaultBackgroundColor,
        border: defaultBorderColor,
      };
    }
  });

  const defaultStyle = $derived(
    toCssString({
      padding: '0.5em',
      backgroundColor: colors.background,
      color: palette.text.inverted,
      border: '1px solid',
      borderColor: colors.border,
    })
  );

  const combinedStyle = $derived(`${defaultStyle} ${style}`);

  function handleHoverOn() {
    if (!disabled) {
      colors = { ...colors, background: palette.accent.main };
    }
  }

  function handleHoverOff() {
    if (!disabled) {
      colors = { ...colors, background: defaultBackgroundColor };
    }
  }
</script>

<!--
@component

# Button
A button component.

# Props
* children - Child components.
* onclick - On-click handler.
* disabled - hether the button is disabled or not.
* style - Styles for the component.
-->
<button
  id="btn"
  style={combinedStyle}
  {disabled}
  onclick={() => {
    handleHoverOn();
    if (onclick) {
      onclick();
    }
  }}
  onmouseenter={handleHoverOn}
  onmouseleave={handleHoverOff}
  onmousedown={handleHoverOn}
  onmouseup={handleHoverOff}
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</button>

<style>
  #btn:active,
  #btn:focus {
    outline: none;
  }
</style>
