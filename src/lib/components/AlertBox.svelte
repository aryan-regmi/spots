<script lang="ts">
    import { slide } from 'svelte/transition';
    import Alert from './Alert.svelte';
    import Column from './Column.svelte';

    export type AlertValue = {
        level?: 'basic' | 'warning' | 'error';
        text: string;
    };

    type Props = {
        class?: string;
        style?: string;
        alertStyle?: string;
        alerts: AlertValue[];
    };

    let { class: className, style, alertStyle, alerts }: Props = $props();
</script>

<div class="alert-box {className}" style="position: absolute; {style}">
    <Column spacing="1em" style="margin-bottom: 5em">
        {#each alerts as alert (alert.text)}
            <div transition:slide>
                <Alert level={alert.level} style={alertStyle}
                    >{alert.text}</Alert
                >
            </div>
        {/each}
    </Column>
</div>

<style>
    .alert-box {
        margin: 0;
        padding: 0;
    }
</style>
