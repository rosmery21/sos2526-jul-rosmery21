<script>
    import { onMount } from 'svelte';

    let year = 2017; // Año compatible con ambos datasets
    let errorMsg = "";

    async function loadSunburst() {
        try {
            // 1. Obtener muertes de tu propia API
            const resDeaths = await fetch(`/api/v2/deaths-by-risk-factors?year=${year}`);
            if (!resDeaths.ok) throw new Error("Error cargando muertes");
            const deathsData = await resDeaths.json();

            // 2. Obtener población de la API externa (vía Proxy o directo)
            const resPop = await fetch(`https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?date=${year}&format=json&per_page=300`);
            const popJson = await resPop.json();
            const populations = popJson[1];

            // 3. Cruzar datos por código ISO (campo 'code' en tu API)
            let sunburstPoints = [
                { id: 'world', parent: '', name: `Global ${year}` }
            ];

            deathsData.forEach(d => {
                const popEntry = populations.find(p => p.countryiso3code === d.code);
                const popValue = popEntry && popEntry.value ? popEntry.value.toLocaleString() : "N/A";

                sunburstPoints.push({
                    id: d.entity,
                    parent: 'world',
                    name: d.entity,
                    value: d.deaths_total, // Tamaño de la porción
                    popData: popValue,     // Dato externo para el tooltip
                    color: stringToColor(d.entity) // Función para asignar color único
                });
            });

            renderChart(sunburstPoints);
        } catch (e) {
            errorMsg = e.message;
        }
    }

    function stringToColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `hsl(${hash % 360}, 70%, 50%)`;
    }

    function renderChart(data) {
        Highcharts.chart('sunburstContainer', {
            chart: { height: '600px' },
            title: { text: 'Muertes por Riesgo vs Población por País' },
            series: [{
                type: 'sunburst',
                data: data,
                allowDrillToNode: true,
                cursor: 'pointer',
                levels: [{
                    level: 1,
                    levelIsConstant: false,
                    dataLabels: { rotationMode: 'parallel' }
                }],
                tooltip: {
                    headerFormat: "",
                    pointFormat: 'País: <b>{point.name}</b><br>Muertes: <b>{point.value}</b><br>Población: <b>{point.popData}</b>'
                }
            }]
        });
    }

    onMount(loadSunburst);
</script>

<main>
    <h1>Integración con World Bank API</h1>
    
    {#if errorMsg}
        <p style="color: red;">{errorMsg}</p>
    {/if}

    <div id="sunburstContainer"></div>

    <section>
        <p>
            Esta visualización utiliza un gráfico de <strong>Sunburst</strong> para representar la jerarquía de 
            mortalidad por factores de riesgo. El tamaño de cada sección proviene de nuestra API, mientras 
            que los datos de población en el tooltip se obtienen dinámicamente del Banco Mundial para el año {year}.
        </p>
    </section>
</main>