<script lang="ts">
    const {
        spacing = '0.1em',
        class: className = '',
        children,
        style = '',
        ...restProps
    } = $props();
</script>

<div class="row {className}" style="gap: {spacing}; {style}" {...restProps}>
    {@render children()}
</div>

<style>
    .row {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 100%;
    }
</style>
