<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    let chartCanvas;
    let loading = $state(true);
    let errorMsg = $state("");

    async function loadIntegration() {
        try {
            const resMyApi = await fetch('/api/v2/pandemics');
            if (!resMyApi.ok) throw new Error("Fallo al conectar con mi API");
            const allMyData = await resMyApi.json();

            const paises = [...new Set(allMyData.map(d => d.entity))].slice(0, 10);

            if (paises.length === 0) {
                errorMsg = "Tu base de datos de pandemias está vacía.";
                loading = false;
                return;
            }

            let poblacionesExternas = [];
            let muertesPolio = [];
            let muertesMalaria = [];
            let muertesTuberculosis = [];

            for (let pais of paises) {
                const misDatos = allMyData.find(d => d.entity === pais);
                muertesPolio.push(misDatos.polio);
                muertesMalaria.push(misDatos.malaria);
                muertesTuberculosis.push(misDatos.tuberculosis);
                
                const resExtApi = await fetch(`/api/proxy/population?country=${pais}`);
                
                if (resExtApi.ok) {
                    const extData = await resExtApi.json();
                    poblacionesExternas.push(extData?.population || 10000000);
                } else {
                    poblacionesExternas.push(10000000);
                }

                await new Promise(r => setTimeout(r, 4000));
            }

            renderChart(paises, poblacionesExternas, muertesPolio, muertesMalaria, muertesTuberculosis);
            loading = false;

        } catch (e) {
            console.error(e);
            errorMsg = "Error de conexión interno.";
            loading = false;
        }
    }

    function renderChart(nombresPaises, pops, polios, malarias, tuberculosis) {
        new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: nombresPaises,
                datasets: [
                    {
                        label: 'Población Total',
                        data: pops,
                        backgroundColor: 'blue'
                    },
                    {
                        label: 'Muertes Polio',
                        data: polios,
                        backgroundColor: 'red'
                    },
                    {
                        label: 'Muertes Malaria',
                        data: malarias,
                        backgroundColor: 'yellow'
                    },
                    {
                        label: 'Muertes Tuberculosis',
                        data: tuberculosis,
                        backgroundColor: 'green'
                    }
                ]
            },
            options: {
                scales: { y: { type: 'logarithmic' } }
            }
        });
    }

    onMount(loadIntegration);
</script>

<main style="padding: 20px;">
    <h2>Integración: Pandemias y Población Múltiple</h2>
    <p>Comparativa cruzando mi base de datos con la API externa de RapidAPI en tiempo real.</p>
    <hr>

    {#if loading}
        <p>Cargando datos de varios países, esto puede tardar un segundo...</p>
    {:else if errorMsg}
        <p>{errorMsg}</p>
    {/if}

    <div>
        <canvas bind:this={chartCanvas}></canvas>
    </div>

    <div>
        <a href="/integrations"><button>Volver</button></a>
    </div>
</main>