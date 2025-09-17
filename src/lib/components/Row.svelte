<script lang="ts">
  const {
    spacing = '0.1em',
    class: className = '',
    children,
    style = '',
    ...restProps
  } = $props();
</script>

<div class="row {className}" style="gap: {spacing}; {style}" {...restProps}>
  {@render children()}
</div>

<style>
  .row {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;

    /* Custom properties */
    margin: var(--row-margin);
    padding: var(--row-padding);
    justify-content: var(--row-justify-content);
    align-items: var(--row-align-items);
  }
</style>
