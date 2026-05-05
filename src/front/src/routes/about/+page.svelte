<script>
    import { loadAboutInfo } from '$lib/utils/aboutData.js';
</script>

<main class="container">
    <h1>About</h1>
    {@html loadAboutInfo()}
</main>