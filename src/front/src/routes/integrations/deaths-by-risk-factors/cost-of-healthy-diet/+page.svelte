<script>
    import { onMount } from 'svelte';

    let countries = [];
    let selectedCountry = 'Spain'; 
    let gdpData = [];
    let loading = true;
    let errorMsg = "";

    onMount(async () => {
        try {
            await loadCountries();
            if (countries.length > 0) {
                await loadGDP();
            }
        } catch (e) {
            errorMsg = "Error al conectar con el servidor central.";
        } finally {
            loading = false;
        }
    });

    async function loadCountries() {
        const res = await fetch("/api/v2/integrations/deaths-by-risk-factors/worldbank-gdp/countries");
        if (res.ok) {
            countries = await res.json();
        } else {
            throw new Error();
        }
    }

    async function loadGDP() {
        loading = true;
        const res = await fetch(`/api/v2/integrations/deaths-by-risk-factors/worldbank-gdp/${selectedCountry}`);
        if (res.ok) {
            const result = await res.json();
            // El Banco Mundial devuelve [metadatos, datos]
            // Filtramos nulos y revertimos para que el tiempo fluya de izquierda a derecha[cite: 1]
            gdpData = result[1]
                .filter(d => d.value !== null)
                .reverse();
            renderChart();
        } else {
            errorMsg = "No se encontraron registros económicos para este país.";
        }
        loading = false;
    }

    function renderChart() {
        if (typeof Highcharts !== 'undefined' && gdpData.length > 0) {
            // El formato Variwide requiere: [nombre/categoría, valor_y, valor_ancho]
            const variwideSeries = gdpData.map(d => [
                d.date, 
                d.value, // Altura: PIB de ese año[cite: 1]
                d.value  // Ancho: También proporcional al PIB para enfatizar volumen[cite: 1]
            ]);

            Highcharts.chart('chart-variwide', {
                chart: {
                    type: 'variwide'
                },
                title: {
                    text: `Análisis Variwide del PIB: ${gdpData[0].country.value}`
                },
                subtitle: {
                    text: 'El ancho y la altura de las columnas representan el PIB anual'
                },
                xAxis: {
                    type: 'category',
                    title: { text: 'Años' }
                },
                yAxis: {
                    title: { text: 'PIB (US$ actuales)' }
                },
                legend: { enabled: false },
                series: [{
                    name: 'PIB Anual',
                    data: variwideSeries,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:,.0f}'
                    },
                    tooltip: {
                        pointFormat: 'PIB: <b>{point.y:,.0f} $</b><br>'
                    },
                    colorByPoint: true
                }]
            });
        }
    }
</script>

<svelte:head>
    <!-- Cargamos Highcharts y el módulo Variwide específico[cite: 1] -->
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/variwide.js" on:load={renderChart}></script>
</svelte:head>

<div class="container mt-4 mb-5">
    <div class="row mb-4">
        <div class="col-12 text-center">
            <h2 class="display-6">Gráfico Variwide - PIB Mundial</h2>
            <p class="text-secondary">Visualización de dos dimensiones en columnas de ancho variable.</p>
        </div>
    </div>

    {#if errorMsg}
        <div class="alert alert-danger" role="alert">{errorMsg}</div>
    {/if}

    <div class="card bg-light border-0 shadow-sm p-4 mb-4">
        <div class="row align-items-center justify-content-center">
            <div class="col-auto">
                <label for="country" class="fw-bold">Explorar País:</label>
            </div>
            <div class="col-md-5">
                <select id="country" class="form-select border-primary" bind:value={selectedCountry} on:change={loadGDP}>
                    {#each countries as country}
                        <option value={country.id}>{country.name}</option>
                    {/each}
                </select>
            </div>
            {#if loading}
                <div class="col-auto">
                    <div class="spinner-grow text-primary" role="status"></div>
                </div>
            {/if}
        </div>
    </div>

    <!-- Contenedor del Gráfico Variwide -->
    <div id="chart-variwide" class="border rounded bg-white shadow-sm" style="width:100%; height:550px;"></div>

    <div class="mt-4">
        <button class="btn btn-outline-dark" on:click={() => window.history.back()}>
            Regresar a Integraciones
        </button>
    </div>
</div>

<style>
    #chart-variwide {
        padding: 20px;
    }
    .container {
        max-width: 1100px;
    }
</style>