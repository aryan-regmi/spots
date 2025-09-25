<script lang="ts">
  import type { RestProps } from '@/utils/restProps';

  type Props = {
    class?: string;
    style?: string;
    spacing?: string;
  } & RestProps;
  const {
    class: className,
    style,
    spacing = '0.1em',
    children,
    ...restProps
  }: Props = $props();

  const combinedClass = `row ${className}`;
  const combinedStyle = `gap: ${spacing}; ${style}`;
</script>

<div class={combinedClass} style={combinedStyle} {...restProps}>
  {@render children()}
</div>

<style>
  .row {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
  }
</style>
