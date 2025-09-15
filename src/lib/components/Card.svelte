<script lang="ts">
    const {
        children = undefined,
        style = '',
        class: className = '',
        ...restProps
    } = $props();
</script>

<div class="card {className}" {style} {...restProps}>
    {@render children()}
</div>

<style>
    .card {
        box-shadow: 0 4px 6px 0 rgba(80, 80, 80, 0.2);
        transition: 0.3s;
        background-color: #2f2f2f;
        border-radius: 0.5em;
    }
</style>
