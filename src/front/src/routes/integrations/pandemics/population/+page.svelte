<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    let chartCanvas;
    let myChart;
    let loading = $state(true);
    let errorMsg = $state("");
    let externalApiWarning = $state(""); 
    
    let cruceExitoso = $state(false); 
    
    let allMyData = [];
    let countries = $state([]);
    
    let selectedCountry = $state("");
    let yearsRange = $state("");

    async function loadInitialDataFromBackend() {
        loading = true;
        try {
            const res = await fetch('/api/v2/pandemics/loadInitialData');
            if (res.ok) {
                alert("Datos iniciales cargados con éxito en la base de datos");
                await initData();
            } else {
                errorMsg = "Error al cargar los datos iniciales en el servidor.";
            }
        } catch (e) {
            errorMsg = "Fallo de conexión con el servidor.";
        } finally {
            loading = false;
        }
    }

    async function initData() {
        loading = true; 
        errorMsg = "";  
        try {
            const resMyApi = await fetch('/api/v2/pandemics?limit=20000');
            if (!resMyApi.ok) throw new Error("Fallo al conectar con tu API");
            allMyData = await resMyApi.json();

            countries = [...new Set(allMyData.map(d => d.entity))].sort();

            if (countries.length > 0) {
                if (!selectedCountry) selectedCountry = countries[0];
                await loadData();
            } else {
                errorMsg = "La base de datos está vacía.";
                loading = false;
            }
        } catch (e) {
            errorMsg = "Error al inicializar los datos.";
            loading = false;
        }
    }

    async function loadData() {
        if (!countries.includes(selectedCountry)) return;

        loading = true;
        externalApiWarning = ""; 
        cruceExitoso = false;

        try {
            const countryRecords = allMyData.filter(d => d.entity === selectedCountry);
            if (countryRecords.length === 0) throw new Error("No hay datos para este país.");
            
            const years = countryRecords.map(d => d.year);
            yearsRange = `${Math.min(...years)} - ${Math.max(...years)}`;

            let totalMalaria = 0, totalTuberculosis = 0, totalHiv = 0, totalCholera = 0;
            let countMalaria = 0, countTuberculosis = 0, countHiv = 0, countCholera = 0;

            countryRecords.forEach(record => {
                if (record.malaria != null) { totalMalaria += record.malaria; countMalaria++; }
                if (record.tuberculosis != null) { totalTuberculosis += record.tuberculosis; countTuberculosis++; }
                if (record.hiv_aids != null) { totalHiv += record.hiv_aids; countHiv++; }
                if (record.cholera != null) { totalCholera += record.cholera; countCholera++; }
            });

            const averageRecord = {
                malaria: countMalaria > 0 ? (totalMalaria / countMalaria) : 0,
                tuberculosis: countTuberculosis > 0 ? (totalTuberculosis / countTuberculosis) : 0,
                hiv_aids: countHiv > 0 ? (totalHiv / countHiv) : 0,
                cholera: countCholera > 0 ? (totalCholera / countCholera) : 0
            };
            
            const resExtApi = await fetch(`/api/v2/pandemics/integrations/population?country=${encodeURIComponent(selectedCountry)}`);            
            let pop = 0;
            
            if (resExtApi.ok) {
                const extData = await resExtApi.json();

                if (Array.isArray(extData) && extData.length > 0 && extData[0].population) { 
                    pop = extData[0].population; 
                } 
                else if (extData && extData.population) { 
                    pop = extData.population; 
                }

                if (pop > 0) {
                    cruceExitoso = true;
                } else {
                    externalApiWarning = `No hay datos de población para ${selectedCountry}.`;
                }
            } else {
                externalApiWarning = "La API de población no responde.";
            }

            if (cruceExitoso) {
                setTimeout(() => renderChart(averageRecord, pop), 50);
            }
            
            loading = false;
        } catch (e) {
            errorMsg = "Error al cargar la comparativa.";
            loading = false;
        }
    }

    function handleCountryChange() {
        loadData();
    }

    function renderChart(averageRecord, pop) {
        if (!chartCanvas) return;
        if (myChart) myChart.destroy();

        myChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: [`${selectedCountry}`],
                datasets: [
                    { label: 'Población Actual', data: [pop], backgroundColor: 'blue' },
                    { label: 'Media Malaria', data: [averageRecord.malaria], backgroundColor: 'pink' },
                    { label: 'Media Tuberculosis', data: [averageRecord.tuberculosis], backgroundColor: 'green' },
                    { label: 'Media VIH/SIDA', data: [averageRecord.hiv_aids], backgroundColor: 'yellow' },
                    { label: 'Media Cólera', data: [averageRecord.cholera], backgroundColor: 'red' }
                ]
            },
            options: {
                scales: { y: { type: 'logarithmic' } }
            }
        });
    }

    onMount(initData);
</script>

<main>
    <h2>Visualización Analítica: Pandemias y Población</h2>
    
    <div>
        <a href="/pandemics">
            <button>Volver a la tabla</button>
        </a>

        <label>
            País:
            <select bind:value={selectedCountry} onchange={handleCountryChange}>
                {#each countries as c}
                    <option value={c}>{c}</option>
                {/each}
            </select>
        </label>
    </div>

    <hr>

    {#if yearsRange && !loading && !externalApiWarning && !errorMsg}
        <div>
            Medias calculadas entre: <strong>{yearsRange}</strong>
        </div>
    {/if}

    {#if loading}
        <p>Buscando y cruzando datos...</p>
    {:else if externalApiWarning}
        <div>
            <strong>Atención:</strong> {externalApiWarning}
        </div>
    {:else if errorMsg}
        <p>{errorMsg}</p>
    {/if}

    {#if cruceExitoso && !loading}
        <div>
            <canvas bind:this={chartCanvas}></canvas>
        </div>
    {/if}
</main>