<script>
    import { onMount } from 'svelte';

    let chartContainer = $state();
    let myChart;
    
    let loading = $state(true);
    let errorMsg = $state("");
    let externalApiWarning = $state(""); 
    let cruceExitoso = $state(false); 
    
    let allMyData = [];
    let allExtData = [];
    let commonCountries = $state([]);
    let selectedCountry = $state("");

    const EXT_API_URL = "https://sos2526-26.onrender.com/api/v2/national-team-rankings-per-years/";
    const EXT_LOAD_URL = "https://sos2526-26.onrender.com/api/v2/national-team-rankings-per-years/loadInitialData";

    async function loadCompanionData() {
        try {
            const res = await fetch(EXT_LOAD_URL);
            if (res.ok) {
                alert("¡Datos del compañero cargados con éxito!");
                await initData();
            }
        } catch (e) {
            alert("Error al conectar con el servidor del compañero.");
        }
    }

    async function initData() {
        loading = true; 
        errorMsg = "";  
        try {
            const resMyApi = await fetch('/api/v2/pandemics?limit=20000');
            allMyData = await resMyApi.json();

            const resExtApi = await fetch(EXT_API_URL);
            if (!resExtApi.ok) {
                externalApiWarning = "La API del compañero no responde.";
                loading = false;
                return;
            }
            allExtData = await resExtApi.json();

            const myCountries = [...new Set(allMyData.map(d => d.entity))];
            const extCountries = [...new Set(allExtData.map(d => d.country || d.entity))];
            commonCountries = myCountries.filter(c => extCountries.includes(c)).sort();

            if (commonCountries.length > 0) {
                if (!selectedCountry) selectedCountry = commonCountries[0];
                await loadData();
            } else {
                errorMsg = "No hay países en común.";
                loading = false;
            }
        } catch (e) {
            errorMsg = "Error al cargar datos.";
            loading = false;
        }
    }

    async function loadData() {
        if (!commonCountries.includes(selectedCountry)) return;
        loading = true;
        cruceExitoso = false;
        externalApiWarning = "";

        try {
            const myRecords = allMyData.filter(d => d.entity === selectedCountry);
            const extRecords = allExtData.filter(d => (d.country || d.entity) === selectedCountry);

            let mainSeriesData = [];
            let yearsFound = [];

            extRecords.forEach(ext => {
                const my = myRecords.find(d => d.year === ext.year);
                
                if (my) {
                    const mRaw = my.malaria || 0;
                    const tRaw = my.tuberculosis || 0;
                    const hRaw = my.hiv_aids || 0;
                    const cRaw = my.cholera || 0;
                    const total = mRaw + tRaw + hRaw + cRaw;

                    let p = 0;
                    Object.keys(ext).forEach(k => {
                        if (typeof ext[k] === 'number' && !['year', 'id', '_id', 'rank', 'position'].includes(k.toLowerCase())) {
                            if (ext[k] > p) p = ext[k];
                        }
                    });

                    if (p > 0 && total > 0) {
                        yearsFound.push(ext.year);
                        
                        mainSeriesData.push([
                            ext.year, p, total, 
                            ext.year, p, total, mRaw, tRaw, hRaw, cRaw
                        ]);
                    }
                }
            });

            if (mainSeriesData.length === 0) {
                externalApiWarning = `No hay datos válidos cruzados para ${selectedCountry} (Faltan muertes o puntos de fútbol en los años comunes).`;
                loading = false;
                return;
            }

            const finalSeries = [
                { name: 'Total Pandemias', data: mainSeriesData }
            ];

            const minYear = Math.min(...yearsFound);
            const maxYear = Math.max(...yearsFound);

            cruceExitoso = true;
            loading = false;
            setTimeout(() => renderChart(finalSeries, minYear, maxYear), 100);
        } catch (e) {
            loading = false;
        }
    }

    async function renderChart(series, min, max) {
        if (!chartContainer) return;
        const module = await import('apexcharts');
        const ApexCharts = module.default || module;
        if (myChart) myChart.destroy();

        myChart = new ApexCharts(chartContainer, {
            series: series,
            chart: {
                type: 'bubble',
                height: 600,
                zoom: { enabled: false },
                toolbar: { show: false }
            },
            plotOptions: {
                bubble: {
                    minBubbleRadius: 15,
                    maxBubbleRadius: 70 
                }
            },
            dataLabels: { enabled: false }, 
            stroke: { width: 2, colors: ['#ffffff'] }, 
            colors: ['#e74c3c'],
            fill: { opacity: 0.85 },
            xaxis: {
                type: 'numeric',
                min: min === max ? min - 1 : min - 0.2,
                max: min === max ? max + 1 : max + 0.2,
                tickAmount: Math.max(1, max - min),
                title: { text: "Año de Registro", style: { fontWeight: 'bold' } },
                labels: { formatter: (v) => Math.round(v).toString() }
            },
            yaxis: {
                title: { text: "Puntos FIFA / Ranking", style: { fontWeight: 'bold' } },
                labels: { formatter: (v) => Math.round(v).toString() }
            },
            tooltip: {
                shared: false,
                intersect: true,
                custom: function({ seriesIndex, dataPointIndex, w }) {
                    const data = w.config.series[seriesIndex].data[dataPointIndex];
                    
                    const year = data[3];
                    const points = data[4];
                    const total = data[5];
                    const malaria = data[6];
                    const tb = data[7];
                    const hiv = data[8];
                    const cholera = data[9];

                    return `
                        <div>
                            <div>Año:<b>
                                ${year}
                            </b></div>
                            <div>Puntos Selección: <b>${points.toLocaleString()}</b></div>
                            <div>Total Muertes: <b> ${total.toLocaleString()}</b></div>
                            
                            <div>
                                <div><span>Malaria:</span> <b>${malaria.toLocaleString()}</b></div>
                                <div><span>Tuberculosis:</span> <b>${tb.toLocaleString()}</b></div>
                                <div><span>VIH/SIDA:</span> <b>${hiv.toLocaleString()}</b></div>
                                <div><span>Cólera:</span> <b>${cholera.toLocaleString()}</b></div>
                            </div>
                        </div>`;
                }
            },
            legend: { show: false }, 
            title: {
                text: `Pandemias y Ranking FIFA en ${selectedCountry}`,
                align: 'center',
                style: { fontSize: '18px', fontWeight: 'bold', color: 'black' }
            }
        });
        myChart.render();
    }

    onMount(initData);
</script>

<main>
    <h2>Pandemias vs Fútbol</h2>

    <div>
        <div>
            <button onclick={() => window.location.href='/pandemics'}>Volver a la tabla</button>
            <button onclick={() => window.location.href='/integrations/pandemics'}>Volver</button>
            <button onclick={loadCompanionData}>
                Cargar Datos API Nacional Team Rankings 
            </button>
        </div>
        <select bind:value={selectedCountry} onchange={loadData}>
            {#each commonCountries as c}<option value={c}>{c}</option>{/each}
        </select>
    </div>

    {#if loading}
        <p> Dibujando correlación temporal...</p>
    {:else if externalApiWarning}
        <p> {externalApiWarning}</p>
    {:else if errorMsg}
        <p> {errorMsg}</p>
    {/if}

    {#if cruceExitoso && !loading}
        <div>
            <div bind:this={chartContainer}></div>
        </div>
    {/if}
</main>