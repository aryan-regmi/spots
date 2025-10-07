<script lang="ts">
  import Text from '../Text.svelte';
  import type { ThemeContext } from '@/theme/types';
  import { getContext } from 'svelte';
  import { themeContextKey } from '@/theme/themeContextKey';

  let { messages, fallback }: { messages: string[]; fallback?: string } =
    $props();

  const { currentPalette } = getContext<ThemeContext>(themeContextKey);
  const palette = $derived(currentPalette());
</script>

<!-- 
@component

# ValidationMessageList
A list of validation error messages.

## Props
* messages: string[]  - The list of messages to display. 
* fallback?: string   - The message to display if [messages] is empty

-->
{#if messages.length === 1}
  {#each messages as msg}
    <Text style="color: {palette.error.main}">{msg}</Text>
  {/each}
{:else if messages.length > 1}
  <ul>
    {#each messages as msg}
      <li>
        <Text style="color: {palette.error.main}">{msg}</Text>
      </li>
    {/each}
  </ul>
{:else if messages.length === 0 && fallback}
  <Text style="color: {palette.error.main}">{fallback}</Text>
{/if}

<style>
  ul {
    padding: 0;
    padding-left: 0.7em;
    margin: 0;
    list-style-type: disc;
  }
</style>
