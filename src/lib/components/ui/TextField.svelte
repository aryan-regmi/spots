<script lang="ts">
  import { toCssString } from '@/utils/cssHelpers';
  import Column from './Column.svelte';
  import type { RestProps } from '@/utils/restProps';

  type Props = {
    class?: string;
    style?: string;
    value: string;
    label?: string;
    required?: boolean;
    invalid?: boolean;
    helperText?: () => void;
    oninput?: () => void;
    onfocus?: () => void;
    onblur?: () => void;
    onfocusout?: () => void;
  } & RestProps;

  let {
    class: className,
    style,
    value = $bindable(''),
    label,
    required,
    invalid,
    helperText,
    oninput,
    onfocus,
    onblur,
    onfocusout,
    ...restProps
  }: Props = $props();

  // Styles
  // --------------------------

  const containerStyle = toCssString({
    margin: 0,
    padding: 0,
    width: '100%',
    boxSizing: 'border-box',
  });
</script>

<Column style={containerStyle} spacing="0">
  <!-- The text input -->
  <input type="text" bind:value {...restProps} />
</Column>

<style>
</style>
