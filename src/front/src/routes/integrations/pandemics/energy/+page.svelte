<script>
    import { onMount } from 'svelte';

    let chartContainerPandemics = $state();
    let chartContainerEnergy = $state();
    let chartPandemics;
    let chartEnergy;
    
    let loading = $state(true);
    let errorMsg = $state("");
    let externalApiWarning = $state(""); 
    let cruceExitoso = $state(false); 
    
    let allMyData = [];
    let allExtData = [];
    let commonCountries = $state([]);
    let selectedCountry = $state("");

    const EXT_API_URL = "https://api-sos.pablogamero.com/api/v1/renewable-energy-consumptions";
    const EXT_LOAD_URL = "https://api-sos.pablogamero.com/api/v1/renewable-energy-consumptions/loadInitialData";

    async function loadCompanionData() {
        try {
            const res = await fetch(EXT_LOAD_URL);
            if (res.ok) {
                alert("¡Datos de Energía cargados con éxito!");
                await initData();
            } else {
                alert("El servidor respondió que los datos ya podrían estar cargados.");
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
            if (!resMyApi.ok) throw new Error("Fallo al conectar con tu API local");
            allMyData = await resMyApi.json();

            const resExtApi = await fetch(EXT_API_URL);
            if (!resExtApi.ok) {
                externalApiWarning = "La API de Energía no responde en este momento.";
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
                errorMsg = "No tenéis PAÍSES en común entre las dos bases de datos.";
                loading = false;
            }
        } catch (e) {
            errorMsg = "Error al inicializar los datos: " + e.message;
            loading = false;
        }
    }

    async function loadData() {
        if (!commonCountries.includes(selectedCountry)) return;

        loading = true;
        externalApiWarning = ""; 
        errorMsg = "";
        cruceExitoso = false;

        try {
            const myRecords = allMyData.filter(d => d.entity === selectedCountry);
            const extRecords = allExtData.filter(d => (d.country || d.entity) === selectedCountry);

            const matchedPairs = extRecords
                .map(ext => ({ ext, my: myRecords.find(d => d.year === ext.year) }))
                .filter(({ my }) => my !== undefined);

            if (matchedPairs.length === 0) {
                externalApiWarning = `Tenéis a ${selectedCountry} en común, pero no coincidís en ningún AÑO de registro.`;
                loading = false;
                return;
            }

            matchedPairs.sort((a, b) => a.ext.year - b.ext.year);

            let categories = [];
            let deathsSeries = [];
            let energySeries = [];

            matchedPairs.forEach(({ ext, my }) => {
                const mRaw = my.malaria || 0;
                const tRaw = my.tuberculosis || 0;
                const hRaw = my.hiv_aids || 0;
                const cRaw = my.cholera || 0;
                const totalDeaths = mRaw + tRaw + hRaw + cRaw;

                let totalEnergy = 0;
                Object.keys(ext).forEach(key => {
                    const keyL = key.toLowerCase();
                    if (typeof ext[key] === 'number' && !['year', 'id', '_id'].includes(keyL)) {
                        totalEnergy += ext[key];
                    }
                });

                if (totalDeaths >= 0 && totalEnergy >= 0) {
                    categories.push(ext.year);
                    deathsSeries.push(totalDeaths);
                    energySeries.push(totalEnergy);
                }
            });

            if (categories.length === 0) {
                externalApiWarning = "Los años coinciden, pero no hay datos válidos.";
                loading = false;
                return;
            }

            cruceExitoso = true;
            loading = false; 
            
            setTimeout(() => renderSyncCharts(categories, deathsSeries, energySeries), 100);
            
        } catch (e) {
            errorMsg = "Error crítico al intentar realizar el cruce de datos: " + e.message;
            loading = false;
        }
    }

    async function renderSyncCharts(categories, deathsSeries, energySeries) {
        if (!chartContainerPandemics || !chartContainerEnergy) return;

        try {
            const module = await import('apexcharts');
            const ApexCharts = module.default || module;

            if (chartPandemics) chartPandemics.destroy();
            if (chartEnergy) chartEnergy.destroy();

            const optionsPandemics = {
                series: [{ name: 'Muertes Totales', data: deathsSeries }],
                chart: {
                    id: 'pandemics-chart', 
                    group: 'sync-charts', 
                    type: 'area',
                    height: 250,
                    toolbar: { show: false },
                    zoom: { enabled: false }
                },
                colors: ['#e74c3c'],
                stroke: { curve: 'smooth', width: 2 },
                fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1, stops: [0, 90, 100] } },
                dataLabels: { enabled: false },
                xaxis: {
                    categories: categories,
                    labels: { show: false },
                    tooltip: { enabled: false }
                },
                yaxis: {
                    labels: { formatter: (val) => new Intl.NumberFormat('es-ES').format(val) },
                    title: { text: "Muertes", style: { fontWeight: 'bold', color: '#e74c3c' } }
                },
                title: {
                    text: 'Impacto de Pandemias',
                    align: 'left',
                    style: { fontSize: '14px', color: '#e74c3c' }
                }
            };

            const optionsEnergy = {
                series: [{ name: 'Energía Renovable', data: energySeries }],
                chart: {
                    id: 'energy-chart',    
                    group: 'sync-charts',  
                    type: 'area',
                    height: 250,
                    toolbar: { show: false },
                    zoom: { enabled: false }
                },
                colors: ['#2ecc71'], 
                stroke: { curve: 'smooth', width: 2 },
                fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1, stops: [0, 90, 100] } },
                dataLabels: { enabled: false },
                xaxis: {
                    categories: categories,
                    title: { text: "Evolución Temporal (Años)", style: { fontWeight: 'bold' } }
                },
                yaxis: {
                    labels: { formatter: (val) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(val) },
                    title: { text: "Energía Consumida", style: { fontWeight: 'bold', color: '#2ecc71' } }
                },
                title: {
                    text: 'Consumo de Energía Renovable',
                    align: 'left',
                    style: { fontSize: '14px', color: '#2ecc71' }
                }
            };

            chartPandemics = new ApexCharts(chartContainerPandemics, optionsPandemics);
            chartEnergy = new ApexCharts(chartContainerEnergy, optionsEnergy);

            chartPandemics.render();
            chartEnergy.render();
            
        } catch (error) {
            console.error("Error al pintar las gráficas sincronizadas:", error);
            errorMsg = "Error al cargar ApexCharts.";
        }
    }

    onMount(initData);
</script>

<main>
    <h2>Pandemias vs Energía Renovable</h2>
    
    <div>
        
        <div>
            <button onclick={() => window.location.href='/pandemics'}>Volver a Tabla</button>
            <button onclick={() => window.location.href='/integrations/pandemics'}>Volver</button>
            <button onclick={loadCompanionData}>
                Cargar Datos API Energía
            </button>
        </div>

        <label>
            <strong>Seleccionar PAÍS:</strong>
            <select bind:value={selectedCountry} onchange={loadData}>
                {#each commonCountries as c}
                    <option value={c}>{c}</option>
                {/each}
            </select>
        </label>
    </div>

    {#if loading}
        <div>
            <p>Sincronizando datos temporales...</p>
        </div>
    {:else if externalApiWarning}
        <div>
             {externalApiWarning}
        </div>
    {:else if errorMsg}
        <p> {errorMsg}</p>
    {/if}

    {#if cruceExitoso && !loading}
        <div>
            <div bind:this={chartContainerPandemics}></div>
            <div bind:this={chartContainerEnergy}></div>
        </div>
    {/if}
</main>