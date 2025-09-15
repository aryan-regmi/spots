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
</script>

<Card class={classes} {style}>
    <Row class="alert-row-content" spacing="1em">
        <WarningCircle style="font-size: 2em" />
        {@render children()}
    </Row>
</Card>

<style>
    :global(.alert) {
        position: absolute;
        width: 10em;
        margin: 0;
        padding: 0.5em 1.5em 0.5em 1.5em;
        border: 1px ridge white;
    }

    :global(.alert-row-content) {
        padding: 0;
        margin: 0;
        justify-content: center;
        align-items: center;
    }
</style>
