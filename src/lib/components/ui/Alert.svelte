<script lang="ts">
  import { getContext } from 'svelte';
  import Card from './Card.svelte';
  import Row from './Row.svelte';
  import Text from './Text.svelte';
  import WarningCircle from 'phosphor-svelte/lib/WarningCircle';
  import type { ThemeContext } from '@/theme/types';
  import { themeContextKey } from '@/theme/themeContextKey';

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

  const { currentPalette } = getContext<ThemeContext>(themeContextKey);
  const palette = $derived(currentPalette());

  const cardStyles = $state({
    margin: 0,
    padding: '0.5em 1.5em',
    justifyContent: 'center',
    backgroundColor: '',
    color: '',
    border: '1px ridge white',
    borderColor: '',
  });

  // Updates the styles based on the alert level.
  $effect(() => {
    switch (level) {
      case 'basic':
        cardStyles.backgroundColor = palette.background.surface;
        cardStyles.color = palette.text.primary;
        cardStyles.borderColor = palette.border.strong;
        break;
      case 'warning':
        cardStyles.backgroundColor = palette.text.secondary;
        cardStyles.color = palette.text.inverted;
        cardStyles.borderColor = palette.accent.main;
        break;
      case 'error':
        cardStyles.backgroundColor = palette.basic.primary;
        cardStyles.color = palette.text.inverted;
        cardStyles.borderColor = palette.border.light;
        break;
      default:
        break;
    }
  });
</script>

<Card
  class={className}
  {style}
  --card-margin={cardStyles.margin}
  --card-padding={cardStyles.padding}
  --card-justify-content={cardStyles.justifyContent}
  --card-background-color={cardStyles.backgroundColor}
  --card-color={cardStyles.color}
  --card-border={cardStyles.border}
  --card-border-color={cardStyles.borderColor}
>
  <Row
    spacing="0.5em"
    --row-margin={0}
    --row-padding={0}
    --row-justify-content={'center'}
    --row-align-items={'center'}
    --row-vertical-align={'middle'}
  >
    <WarningCircle size="2em" />
    {@render children()}
  </Row>
</Card>
