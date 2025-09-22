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
                cardStyles.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                cardStyles.color = 'rgba(200, 200, 200, 1)';
                cardStyles.borderColor = 'rgba(255, 226, 183, 0.8)';
            case 'warning':
                cardStyles.backgroundColor = 'rgba(110, 110, 30, 0.3)';
                cardStyles.color = 'rgba(255, 255, 190, 1)';
                cardStyles.borderColor = 'rgba(255, 226, 183, 1)';
            case 'error':
                cardStyles.backgroundColor = 'rgba(110, 50, 50, 0.3)';
                cardStyles.color = 'rgba(255, 100, 100, 1)';
                cardStyles.borderColor = 'rgba(255, 100, 100, 1)';
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
        <WarningCircle style="font-size: 2em" />
        {@render children()}
    </Row>
</Card>
