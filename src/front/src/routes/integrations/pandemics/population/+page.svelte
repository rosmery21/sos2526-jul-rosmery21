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

    async function initData() {
        try {
            const resMyApi = await fetch('/api/v2/pandemics?limit=20000');
            if (!resMyApi.ok) throw new Error("Fallo al conectar con tu API");
            allMyData = await resMyApi.json();

            countries = [...new Set(allMyData.map(d => d.entity))].sort();

            if (countries.length > 0) {
                selectedCountry = countries[0];
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
            
            const resExtApi = await fetch(`/api/proxy/population?country=${encodeURIComponent(selectedCountry)}`);
            let pop = 0;
            
            if (resExtApi.ok) {
                const extData = await resExtApi.json();

                if (extData && extData.count) { pop = extData.count; } 
                else if (extData && extData.population) { pop = extData.population; } 
                else if (extData && extData.body && extData.body.population) { pop = extData.body.population; }

                if (pop > 0) {
                    cruceExitoso = true;
                } else {
                    externalApiWarning = `No se puede hacer el cruce: La API externa no tiene datos de población para ${selectedCountry}.`;
                }
            } else {
                externalApiWarning = "RapidAPI ha fallado.";
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
                labels: [`${selectedCountry} (Promedio Histórico)`],
                datasets: [
                    {
                        label: 'Población Actual',
                        data: [pop],
                        backgroundColor: 'blue' 
                    },
                    {
                        label: 'Media Malaria',
                        data: [averageRecord.malaria],
                        backgroundColor: 'pink' 
                    },
                    {
                        label: 'Media Tuberculosis',
                        data: [averageRecord.tuberculosis],
                        backgroundColor: 'green' 
                    },
                    {
                        label: 'Media VIH/SIDA',
                        data: [averageRecord.hiv_aids],
                        backgroundColor: 'yellow' 
                    },
                    {
                        label: 'Media Cólera',
                        data: [averageRecord.cholera],
                        backgroundColor: 'red' 
                    }
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
    <h2>Integración Pandemias y Población</h2>
    <hr>

    <div>
        <div>
            <label>País:</label>
            
            <input 
                type="text" 
                list="lista-paises" 
                bind:value={selectedCountry} 
                onchange={handleCountryChange} 
                placeholder="Escribe para buscar..."
            />
            <datalist id="lista-paises">
                {#each countries as c}
                    <option value={c}></option>
                {/each}
            </datalist>
        </div>

        {#if yearsRange && !loading && !externalApiWarning}
            <div>
                Calculando medias de la base de datos entre los años: <strong>{yearsRange}</strong>
            </div>
        {/if}
    </div>

    {#if loading}
        <p> Buscando cruce de datos...</p>
    {:else if externalApiWarning}
        <div>
            <h3>Cruce no disponible</h3>
            <p>{externalApiWarning}</p>
        </div>
    {:else if errorMsg}
        <p>{errorMsg}</p>
    {/if}

    {#if cruceExitoso && !loading}
        <div>
            <canvas bind:this={chartCanvas}></canvas>
        </div>
    {/if}

    <div>
        <a href="/integrations/pandemics"><button>Volver al Menú</button></a>
    </div>
</main>