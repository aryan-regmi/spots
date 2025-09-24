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

  // svelte-ignore state_referenced_locally
  let backgroundColor = $state(defaultBackgroundColor);

  // svelte-ignore state_referenced_locally
  let borderColor = $state(defaultBorderColor);

  const defaultStyle = $derived(
    toCssString({
      padding: '0.5em',
      backgroundColor: backgroundColor,
      color: palette.text.inverted,
      border: '1px solid',
      borderColor: borderColor,
    })
  );

  const combinedStyle = $derived(`${defaultStyle} ${style}`);

  // FIXME: Replace with $derived (see SignupPage)
  $effect(() => {
    if (disabled) {
      backgroundColor = palette.background.surface;
      borderColor = palette.border.light;
    } else {
      backgroundColor = defaultBackgroundColor;
      borderColor = defaultBorderColor;
    }
  });

  function handleHoverOn() {
    if (!disabled) {
      backgroundColor = palette.accent.main;
    }
  }

  function handleHoverOff() {
    if (!disabled) {
      backgroundColor = defaultBackgroundColor;
    }
  }
</script>

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
