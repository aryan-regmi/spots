<script lang="ts">
  import Alert from './Alert.svelte';
  import Column from './Column.svelte';

  type AlertValue = { level?: 'basic' | 'warning' | 'error'; text: string };

  type Props = {
    class?: string;
    style?: string;
    alerts: AlertValue[];
  };

  let { class: className, style, alerts }: Props = $props();
</script>

<div class={className} style="position: absolute; {style}">
  <Column spacing="1em" style="margin-bottom: 5em">
    {#each alerts as alert}
      <Alert level={alert.level}>{alert.text}</Alert>
    {/each}
  </Column>
</div>

