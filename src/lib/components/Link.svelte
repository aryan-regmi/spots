<script lang="ts">
  import { getContext } from 'svelte';
  import Button from './Button.svelte';
  import type { ThemeContext } from '@/theme/types';
  import { themeContextKey } from '@/theme/themeContextKey';
  import { toCssString } from '@/utils/cssHelpers';

  let { children, onclick } = $props();

  const { currentPalette } = getContext<ThemeContext>(themeContextKey);
  const palette = $derived(currentPalette());

  let defaultColor = $derived(palette.basic.primary);

  // svelte-ignore state_referenced_locally
  let color = $state(defaultColor);

  const defaultStyle = $derived(
    toCssString({
      background: 'none',
      border: 'none',
      color: color,
      textDecoration: 'underline',
      textDecorationThickness: '0.01em',
    })
  );

  function handleHoverOn() {
    color = palette.accent.main;
  }

  function handleHoverOff() {
    color = defaultColor;
  }
</script>

<Button
  style={defaultStyle}
  onclick={() => {
    handleHoverOn();
    if (onclick) {
      onclick();
    }
  }}
  onmouseenter={handleHoverOn}
  onmouseleave={handleHoverOff}
>
  {@render children()}
</Button>
