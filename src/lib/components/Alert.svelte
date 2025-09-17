<script lang="ts">
  import Card from './Card.svelte';
  import Row from './Row.svelte';
  import WarningCircle from 'phosphor-svelte/lib/WarningCircle';

  type Props = {
    class?: string;
    style?: string;
    level?: 'basic' | 'warning' | 'error';
    children?: any;
  };
  const {
    class: className = '',
    style = '',
    level = 'basic',
    children,
  }: Props = $props();

  const classes = $derived.by(() => {
    switch (level) {
      case 'basic':
        return `alert ${className}`;
      case 'warning':
        return `alert warning ${className}`;
      case 'error':
        return `alert error ${className}`;
    }
  });

  const styles = $derived.by(() => {
    switch (level) {
      case 'basic':
        return `background-color: rgba(255, 255, 255, 0.5); ${style}`;
      case 'warning':
        return `background-color: rgba(110, 110, 30, 0.3); ${style}`;
      case 'error':
        return `background-color: rgba(100, 50, 50, 0.3); ${style}`;
    }
  });
</script>

<Card id="alert-container" class={classes} style={styles}>
  <Row class="alert-row-content" spacing="0.5em">
    <WarningCircle style="font-size: 2em" />
    {@render children()}
  </Row>
</Card>

<style>
  :global(#alert-container) {
    justify-content: center;
  }

  :global(.alert) {
    position: relative;
    margin: 0;
    padding: 0.5em 1.5em 0.5em 1.5em;
    border: 1px ridge white;
    color: rgba(200, 200, 200, 1);
    border-color: rgba(255, 226, 183, 0.8);
  }

  :global(.warning) {
    color: rgba(255, 255, 190, 1);
    border-color: rgba(255, 226, 183, 1);
  }

  :global(.error) {
    color: rgba(255, 100, 100, 1);
    border-color: rgba(255, 100, 100, 1);
  }

  :global(.alert-row-content) {
    padding: 0;
    margin: 0;
    justify-content: left;
    align-items: center;
  }
</style>
