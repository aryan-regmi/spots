<script>
  import { toCssString } from '@/utils/cssHelpers';
  import { Button } from 'bits-ui';

  let { children, onclick, style = '' } = $props();

  let buttonOpacity = $state(1.0);
  let buttonStyle = $derived(
    toCssString({
      all: 'unset',
      cursor: 'pointer',
      opacity: buttonOpacity,
      transition: '0.2s',
    })
  );
  let combinedStyles = $derived(`${buttonStyle} ${style}`);
</script>

<Button.Root
  style={combinedStyles}
  {onclick}
  onmouseenter={() => (buttonOpacity = 0.5)}
  onmouseleave={() => (buttonOpacity = 1.0)}
  onmouseup={() => (buttonOpacity = 0.5)}
  onmousedown={() => (buttonOpacity = 1.0)}
>
  {@render children()}
</Button.Root>
