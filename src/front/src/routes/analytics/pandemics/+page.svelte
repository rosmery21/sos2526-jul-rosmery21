<script>
    import { onMount } from 'svelte';
    import Highcharts from 'highcharts';

    let chartContainer; 
    let chartInstance; 
    let errorMessage = $state("");
    let isLoading = $state(true);

    let allData = $state([]); 
    let countries = $state([]); 
    let selectedCountry = $state("Todos");

    async function loadData() {
        try {
            const response = await fetch('/api/v2/pandemics?limit=1000');
            if (!response.ok) throw new Error("Error al cargar los datos de la API");
            
            allData = await response.json();

            if (allData.length === 0) {
                errorMessage = "No hay datos en la base de datos para mostrar.";
                isLoading = false;
                return;
            }

            countries = [...new Set(allData
            .filter(item => !item.entity.includes('Country') && !item.entity.includes('Pais'))
            .map(item => item.entity)
            )].sort();

            drawChart();
            isLoading = false;

        } catch (error) {
            console.error(error);
            errorMessage = "No se ha podido cargar la gráfica.";
            isLoading = false;
        }
    }

    function drawChart() {
        let filteredData = allData;
        let titleText = 'Proporción de Casos Globales por Enfermedad';

        if (selectedCountry !== "Todos") {
            filteredData = allData.filter(item => item.entity === selectedCountry);
            titleText = `Proporción de Casos en ${selectedCountry}`;
        }

        let totalPolio = 0, totalMalaria = 0, totalHiv = 0;
        let totalTuberculosis = 0, totalCholera = 0, totalRabies = 0;
        let totalYaws = 0, totalSmallpox = 0, totalGuinea = 0;

        filteredData.forEach(item => {
            totalPolio += item.polio || 0;
            totalMalaria += item.malaria || 0;
            totalHiv += item.hiv_aids || 0;
            totalTuberculosis += item.tuberculosis || 0;
            totalCholera += item.cholera || 0;
            totalRabies += item.rabies || 0;
            totalYaws += item.yaws || 0;
            totalSmallpox += item.smallpox || 0;
            totalGuinea += item.guinea_worm || 0;
        });

        const pieData = [
            { name: 'Polio', y: totalPolio },
            { name: 'Malaria', y: totalMalaria },
            { name: 'VIH/SIDA', y: totalHiv },
            { name: 'Tuberculosis', y: totalTuberculosis },
            { name: 'Cólera', y: totalCholera },
            { name: 'Rabia', y: totalRabies },
            { name: 'Frambesia', y: totalYaws },
            { name: 'Viruela', y: totalSmallpox },
            { name: 'Gusano de Guinea', y: totalGuinea }
        ];

        if (chartInstance) {
            chartInstance.setTitle({ text: titleText });
            chartInstance.series[0].setData(pieData);
        } else {
            chartInstance = Highcharts.chart(chartContainer, {
                chart: { type: 'pie', plotBackgroundColor: null, plotBorderWidth: null, plotShadow: false },
                title: { text: titleText, align: 'center' },
                tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b> ({point.y} casos)' },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: { enabled: false },
                        showInLegend: true
                    }
                },
                series: [{ name: 'Porcentaje', colorByPoint: true, data: pieData }]
            });
        }
    }

    $effect(() => {
        if (allData.length > 0) {
            drawChart();
        }
    });

    onMount(() => {
        loadData();
    });
</script>

<main style="padding: 20px; font-family: sans-serif; max-width: 900px; margin: auto;">
    <h2>Visualización Analítica: Pandemias</h2>
    
    <div style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
        <a href="/pandemics">
            <button>Volver a la tabla</button>
        </a>

        <a href="/analytics/pandemics/map">
            <button>
                Ver el Mapa
            </button>
        </a>

        <label style="font-weight: bold; margin-left: auto;">
            Mostrar datos de:
            <select bind:value={selectedCountry} style="padding: 8px; margin-left: 5px; border-radius: 4px;">
                <option value="Todos"> Todo el Mundo (Global)</option>
                {#each countries as country}
                    <option value={country}>{country}</option>
                {/each}
            </select>
        </label>
    </div>

    {#if isLoading}
        <p>Cargando gráfica...</p>
    {/if}

    {#if errorMessage}
        <p style="color: red; font-weight: bold;">{errorMessage}</p>
    {/if}

    <div bind:this={chartContainer} style="width: 100%; height: 500px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 8px; border: 1px solid #ddd; background: white;"></div>
</main>