<script>
    /* eslint-disable svelte/no-navigation-without-resolve */
    import { goto } from '$app/navigation';
</script>

<main>
    <h2>Mis Integraciones - Pandemias</h2>
    <p>
        Aquí puedes acceder a mis distintas integraciones cruzando los datos de pandemias.
    </p>

    <section>
        <div class="card">
            <h3>1. Integración con RapidAPI (Población)</h3>
            <p>
                Uso de proxy propio. Gráfica de barras combinando muertes por pandemias con la población 
                total de múltiples países usando Chart.js.
            </p>
            <button onclick={() => goto('/integrations/pandemics/population')}>
                Ver Integración de Población
            </button>
        </div>

        <div class="card pending">
            <h3>2. API Externa 2 (Pendiente)</h3>
            <p>Próximamente... Aquí irá otra integración con una API de fuera del curso.</p>
            <button disabled>En construcción</button>
        </div>

        <div class="card pending">
            <h3>3. API Externa 3 (Textual) (Pendiente)</h3>
            <p>Próximamente... Esta integración mostrará los datos en HTML (tabla o lista), sin gráfica.</p>
            <button disabled>En construcción</button>
        </div>

        <div class="card pending">
            <h3>4. API de Compañeros SOS 1 (Pendiente)</h3>
            <p>Próximamente... Cruzaremos datos con la API de otro grupo de la clase.</p>
            <button disabled>En construcción</button>
        </div>

        <div class="card pending">
            <h3>5. API de Compañeros SOS 2 (Pendiente)</h3>
            <p>Próximamente... Cruzaremos datos con la API de un segundo grupo de la clase.</p>
            <button disabled>En construcción</button>
        </div>
    </section>

    <div>
        <button class="back-btn" onclick={() => goto('/integrations')}>
            Volver a Integraciones del Grupo
        </button>
    </div>
</main>