<script>
    import { goto } from '$app/navigation';
</script>

<main>
    <h1>Integraciones</h1>
    <section>
        <div class="card">
            <h2>Integraciones de Child Malnutritions</h2>
            <p>Diferentes integraciones realizadas a partir de datos de APIs externas relacionadas con la desnutrición infantil.</p>
            <button onclick={() => goto('/integrations/child-malnutritions')}>
                Ver integraciones
            </button>
        </div>
    </section>
</main>

<style>
    main { padding: 2rem; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; max-width: 400px; }
    button { margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer; }
</style>
