<script>
    import Spiral from 'phosphor-svelte/lib/Spiral';
</script>

<div class="spinner" style="align-items: center; text-align: center;">
    <Spiral font-size="3em" color="white" />
</div>

<style>
    .spinner {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
