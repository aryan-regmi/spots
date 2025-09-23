<script>
  import { toCssString } from '@/utils/cssHelpers';
  import { Button } from 'bits-ui';

  let { children, onclick } = $props();

  let buttonOpacity = $state(1.0);
  let buttonStyle = $derived(
    toCssString({
      all: 'unset',
      transform: 'translateX(-8em)',
      cursor: 'pointer',
      opacity: buttonOpacity,
    })
  );
</script>

<Button.Root
  style={buttonStyle}
  {onclick}
  onmouseenter={() => (buttonOpacity = 0.5)}
  onmouseleave={() => (buttonOpacity = 1.0)}
>
  {@render children()}
</Button.Root>
