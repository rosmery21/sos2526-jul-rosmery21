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

    const EXT_API_URL = "https://sos2526-20-stable.onrender.com/api/v2/wool-stats";
    const EXT_LOAD_URL = "https://sos2526-20-stable.onrender.com/api/v2/wool-stats/loadInitialData";

    async function loadCompanionData() {
        try {
            const res = await fetch(EXT_LOAD_URL);
            if (res.ok) {
                alert("¡Estadísticas de Lana cargadas con éxito!");
                await initData();
            } else {
                alert("El servidor respondió que los datos ya podrían estar cargados.");
            }
        } catch (e) {
            alert("Error al intentar conectar con el cargador de la API externa.");
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
                externalApiWarning = "La API de Lana no responde en este momento.";
                loading = false;
                return;
            }
            
            const rawExtData = await resExtApi.json();
            allExtData = rawExtData.data ? rawExtData.data : (Array.isArray(rawExtData) ? rawExtData : []);

            const myCountries = [...new Set(allMyData.map(d => d.entity))];
            const extCountries = [...new Set(allExtData.map(d => d.reporterdesc))];
            
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
            const extRecordsRaw = allExtData.filter(d => d.reporterdesc === selectedCountry);

            const extByYear = {};
            extRecordsRaw.forEach(ext => {
                const year = ext.period;
                if (!extByYear[year]) extByYear[year] = 0;
                
                Object.keys(ext).forEach(key => {
                    if (typeof ext[key] === 'number' && !['period', 'id', '_id'].includes(key.toLowerCase())) {
                        extByYear[year] += ext[key];
                    }
                });
            });

            let sumMalaria = 0, sumTB = 0, sumHIV = 0, sumCholera = 0, sumLana = 0;
            let matchedYearsCount = 0;

            Object.keys(extByYear).forEach(yearStr => {
                const year = parseInt(yearStr);
                const my = myRecords.find(d => d.year === year);
                if (my) {
                    sumMalaria += (my.malaria || 0);
                    sumTB += (my.tuberculosis || 0);
                    sumHIV += (my.hiv_aids || 0);
                    sumCholera += (my.cholera || 0);
                    sumLana += extByYear[year];
                    matchedYearsCount++;
                }
            });

            if (matchedYearsCount === 0) {
                externalApiWarning = `Tenéis a ${selectedCountry} en común, pero no coincidís en ningún AÑO para hacer la media.`;
                loading = false;
                return;
            }

            const avgMalaria = sumMalaria / matchedYearsCount;
            const avgTB = sumTB / matchedYearsCount;
            const avgHIV = sumHIV / matchedYearsCount;
            const avgCholera = sumCholera / matchedYearsCount;
            const avgLana = sumLana / matchedYearsCount;

            let polarSeries = []; 
            let polarLabels = []; 
            let realValues = [];  
            let sliceColors = []; 

            const addSlice = (name, realAvg, type, color) => {
                const safeValue = realAvg || 0;
                const visualValue = Math.log10(safeValue + 1);
                
                polarSeries.push(visualValue);
                polarLabels.push(name);
                realValues.push({ value: safeValue, type: type });
                sliceColors.push(color);
            };

            addSlice('Media Malaria', avgMalaria, 'Malaria', '#e74c3c');
            addSlice('Media Tuberculosis', avgTB, 'TB', '#e67e22');
            addSlice('Media VIH/SIDA', avgHIV, 'VIH', '#9b59b6');
            addSlice('Media Cólera', avgCholera, 'Cólera', '#1abc9c');
            addSlice('Media Sector Textil (Lana)', avgLana, 'Lana', '#f1c40f');

            cruceExitoso = true;
            loading = false; 
            
            setTimeout(() => renderAveragedPolarChart(polarSeries, polarLabels, realValues, sliceColors, matchedYearsCount), 100);
            
        } catch (e) {
            errorMsg = "Error crítico al procesar las medias: " + e.message;
            loading = false;
        }
    }

    async function renderAveragedPolarChart(series, labels, realValues, colors, yearsCount) {
        if (!chartContainer) return;

        try {
            const module = await import('apexcharts');
            const ApexCharts = module.default || module;

            if (myChart) myChart.destroy();

            const options = {
                series: series,
                labels: labels,
                chart: {
                    type: 'polarArea',
                    height: 550,
                    toolbar: { show: false }
                },
                colors: colors,
                stroke: {
                    colors: ['#fff'],
                    width: 2 
                },
                plotOptions: {
                    polarArea: {
                        rings: { strokeWidth: 1, strokeColor: '#eee' },
                        spokes: { strokeWidth: 1, connectorColors: '#eee' }
                    }
                },
                fill: { opacity: 0.85 },
                yaxis: {
                    show: false
                },
                tooltip: {
                    theme: 'light',
                    custom: function({ seriesIndex, w }) {
                        const labelName = w.config.labels[seriesIndex];
                        const color = w.config.colors[seriesIndex];
                        
                        const realData = realValues[seriesIndex];
                        const formattedValue = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(realData.value);
                        
                        let unit = 'personas/año';
                        if (realData.type === 'Lana') {
                            unit = 'uds/año';
                        }

                        return `
                            <div>
                                <strong style="color: ${color}; font-size: 16px;"> ${labelName}</strong>
                                <div>
                                    <b>${formattedValue}</b> <span>${unit}</span>
                                </div>
                            </div>
                        `;
                    }
                },
                legend: {
                    position: 'bottom',
                    fontSize: '14px',
                    markers: { radius: 12 },
                    itemMargin: { horizontal: 10, vertical: 5 }
                },
                title: {
                    text: `Medias Históricas: Lana vs Pandemias en ${selectedCountry}`,
                    align: 'center',
                    style: { fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' }
                }
            };

            myChart = new ApexCharts(chartContainer, options);
            myChart.render();
            
        } catch (error) {
            console.error("Error al pintar la gráfica de área polar:", error);
            errorMsg = "Error al cargar ApexCharts.";
        }
    }

    onMount(initData);
</script>

<main>
    <h2>Pandemias vs Sector Textil</h2>
    
    <div>
        <div>
            <button onclick={() => window.location.href='/pandemics'}>Volver a Tabla</button>
            <button onclick={() => window.location.href='/integrations/pandemics'}>Volver</button>
            <button onclick={loadCompanionData}>
                Cargar Datos API Lana
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
            <p>Calculando medias históricas...</p>
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
            <div bind:this={chartContainer}></div>
        </div>
    {/if}
</main>