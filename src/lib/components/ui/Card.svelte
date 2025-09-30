<!-- FIXME: Rename to Paper -->

<script lang="ts">
  const {
    children = undefined,
    style = '',
    class: className = '',
    ...restProps
  } = $props();
</script>

<div class="card {className}" {style} {...restProps}>
  {@render children()}
</div>

<style>
  .card {
    border-radius: 0.5em;
    box-shadow: 0 4px 6px 0 rgba(80, 80, 80, 0.2);
    transition: 0.3s;

    /* Custom properties */
    position: var(--card-position);
    margin: var(--card-margin);
    padding: var(--card-padding);
    justify-content: var(--card-justify-content, flex-start);
    background-color: var(--card-background-color, #2f2f2f);
    color: var(--card-color, white);
    border: var(--card-border);
    border-color: var(--card-border-color);
  }
</style>
