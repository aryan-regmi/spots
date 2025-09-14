<script lang="ts">
    import AuthProvider from '@/auth/AuthProvider.svelte';
    import LandingPage from '@/pages/LandingPage.svelte';
</script>

<main>
    <AuthProvider>
        <LandingPage />
    </AuthProvider>
</main>

<style>
</style>
