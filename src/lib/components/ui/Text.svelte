<script lang="ts">
  import { themeContextKey } from '@/theme/themeContextKey';
  import type { ThemeContext } from '@/theme/types';
  import { toCssString } from '@/utils/cssHelpers';
  import type { RestProps } from '@/utils/restProps';
  import { getContext } from 'svelte';

  type Props = {
    children: any;
    style?: string;
  } & RestProps;
  const { children, style, ...restProps }: Props = $props();

  // Gets the theme context
  const { currentPalette } = getContext<ThemeContext>(themeContextKey);
  const palette = $derived(currentPalette());

  // Styles
  const textStyle = $derived(
    toCssString({
      color: palette.text.primary,
    })
  );
</script>

<!--
@component

# Text
Represents a piece of text.

## Props
* children: any   - Child components.
* style?: string  - CSS style string.

-->
<div style="{textStyle} {style}" {...restProps}>
  {@render children()}
</div>
