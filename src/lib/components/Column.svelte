<script lang="ts">
    const {
        spacing = '0.1em',
        class: className = '',
        children,
        style = '',
        ...restProps
    } = $props();
</script>

<div class="col {className}" style="gap: {spacing}; {style}" {...restProps}>
    {@render children()}
</div>

<style>
    .col {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
    }
</style>
