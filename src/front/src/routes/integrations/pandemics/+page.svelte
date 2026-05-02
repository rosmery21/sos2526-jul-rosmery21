<script>
    /* eslint-disable svelte/no-navigation-without-resolve */
    import { goto } from '$app/navigation';
</script>

<main>
    <h2>Mis Integraciones - Pandemias</h2>
    <p>
        Aquí puedes acceder a mis distintas integraciones cruzando los datos de pandemias con otras apis.
    </p>

    <section>
        <div class="card">
            <h3>1. Integración Pandemias - Población</h3>
            <p>
                Gráfica de barras combinando muertes por pandemias con la población 
                total.
            </p>
            <button onclick={() => goto('/integrations/pandemics/population')}>
                Ver Integración de Población
            </button>
        </div>

        <div class="card"> 
            <h3>2. Integración Pandemias - Riqueza Mundial</h3>
            <p>
                Gráfica de tipo Polar Area combinando muertes por pandemias con 
                datos de PIB (riqueza) y esperanza de vida.
            </p>
            <button onclick={() => goto('/integrations/pandemics/worlddata')}>
                Ver Integración de Riqueza
            </button>
        </div>

        <div class="card"> 
            <h3>3. Integración Pandemias - Universidades</h3>
            <p>
                Muestra una tabla comparativa entre el total de muertes por pandemias 
                y el listado de universidades del país usando HTML.
            </p>
            <button onclick={() => goto('/integrations/pandemics/universities')}>
                Ver Tabla de Universidades
            </button>
        </div>

        <div class="card pending">
            <h3>4. API de Compañeros SOS 1</h3>
            <p>Próximamente... Cruzaremos datos con la API de otro grupo de la clase.</p>
            <button disabled>En construcción</button>
        </div>

        <div class="card pending">
            <h3>5. API de Compañeros SOS 2</h3>
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