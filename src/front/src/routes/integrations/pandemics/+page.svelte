<script>
    /* eslint-disable svelte/no-navigation-without-resolve */
    import { goto } from '$app/navigation';
</script>

<main>
    <div class="header">
        <h2>Panel de Integraciones: Pandemias</h2>
        <p>
            Explora los cruces de datos entre la API de Pandemias y otras apis.
        </p>
        
        <button class="back-btn" onclick={() => goto('/integrations')}>
            Volver al Panel del Grupo
        </button>
    </div>

    <section class="grid">
        <div class="card">
            <h3>1. Pandemias vs Población</h3>
            <p>
                Gráfica que analiza el impacto de la mortalidad por distintas pandemias frente al volumen total de población de cada país.
            </p>
            <button onclick={() => goto('/integrations/pandemics/population')}>
                Ver Integración de Población
            </button>
        </div>

        <div class="card"> 
            <h3>2. Pandemias vs Universidades</h3>
            <p>
                Tabla comparativa entre la mortalidad por distintas pandemias y las universidades en el país.
            </p>
            <button onclick={() => goto('/integrations/pandemics/universities')}>
                Ver Tabla de Universidades
            </button>
        </div>

        <div class="card highlights">
            <h3>3. Pandemias vs COVID-19</h3>
            <p>
                Gráfica que analiza el impacto de la mortalidad por distintas pandemias frente a la mortalidad por COVID-19.
            </p>
            <button onclick={() => goto('/integrations/pandemics/covid')}>
                Ver Integración de COVID-19
            </button>
        </div>

        <div class="card highlights">
            <h3>4. Pandemias vs Lanzamientos Espaciales</h3>
            <p>
                Gráfica que cruza el impacto de las pandemias con los lanzamientos espaciales.
            </p>
            <button onclick={() => goto('/integrations/pandemics/space-launches')}>
                Ver Integración Lanzamientos Espaciales
            </button>
        </div>

        <div class="card highlights">
            <h3>5. Pandemias vs Selecciones Nacionales</h3>
            <p>
                Gráfica que compara la mortalidad por distintas pandemias con el volumen de registros en el ranking de selecciones nacionales.
            </p>
            <button onclick={() => goto('/integrations/pandemics/national-team-rankings-per-years')}>
                Ver Integración Selecciones Nacionales
            </button>
        </div>

        <div class="card highlights">
            <h3>6. Pandemias vs Energía Renovable</h3>
            <p>
                Gráficos de área sincronizados que analizan la evolución temporal de las pandemias frente al consumo de energía renovable.
            </p>
            <button onclick={() => goto('/integrations/pandemics/energy')}>
                Ver Integración Energía Renovable
            </button>
        </div>

        <div class="card pending">
            <h3>7. API de Compañeros SOS 4</h3>
            <p>Próximamente... Integración con los datos de un segundo grupo del curso (SOS Group 4).</p>
            <button disabled>En construcción</button>
        </div>
    </section>
</main>