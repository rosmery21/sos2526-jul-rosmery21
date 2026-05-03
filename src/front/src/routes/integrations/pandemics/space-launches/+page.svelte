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
    let allExtData = [];
    let commonCountries = $state([]);
    let selectedCountry = $state("");
    let yearsRange = $state("");

    const EXT_API_URL = "https://space-launches-8cix.onrender.com/api/v2/space-launches";
    const EXT_LOAD_URL = "https://space-launches-8cix.onrender.com/api/v2/space-launches/loadInitialData";

    async function loadFernandoData() {
        try {
            const res = await fetch(EXT_LOAD_URL);
            if (res.ok) {
                alert("¡Datos del compañero cargados con éxito en su servidor!");
                await initData();
            } else {
                alert("El servidor del compañero respondió con error. Quizás ya están cargados.");
            }
        } catch (e) {
            alert("Error de red o CORS al intentar cargar la API del compañero. Tendrás que hacerlo desde su URL directamente.");
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
                externalApiWarning = "La API del compañero no responde en este momento.";
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
                errorMsg = "La base de datos del compañero parece estar vacía o no tenéis países en común. ¡Prueba a darle al botón naranja de Cargar BD!";
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
            const myCountryRecords = allMyData.filter(d => d.entity === selectedCountry);
            const years = myCountryRecords.map(d => d.year);
            yearsRange = `${Math.min(...years)} - ${Math.max(...years)}`;

            let totalM = 0, countM = 0, totalT = 0, countT = 0;
            let totalH = 0, countH = 0, totalC = 0, countC = 0;

            myCountryRecords.forEach(r => {
                if (r.malaria != null) { totalM += r.malaria; countM++; }
                if (r.tuberculosis != null) { totalT += r.tuberculosis; countT++; }
                if (r.hiv_aids != null) { totalH += r.hiv_aids; countH++; }
                if (r.cholera != null) { totalC += r.cholera; countC++; }
            });

            const logZero = 0.1;
            const avgMalaria = countM > 0 && totalM > 0 ? (totalM / countM) : logZero;
            const avgTuberculosis = countT > 0 && totalT > 0 ? (totalT / countT) : logZero;
            const avgHiv = countH > 0 && totalH > 0 ? (totalH / countH) : logZero;
            const avgCholera = countC > 0 && totalC > 0 ? (totalC / countC) : logZero;
            
            const extCountryRecords = allExtData.filter(d => (d.country === selectedCountry || d.entity === selectedCountry));
            
            if (extCountryRecords.length === 0) {
                externalApiWarning = `No hay datos de lanzamientos espaciales para ${selectedCountry}.`;
                loading = false;
                return;
            }

            const totalLanzamientos = extCountryRecords.length;

            let extLabels = ['Total Lanzamientos'];
            let extValues = [totalLanzamientos === 0 ? logZero : totalLanzamientos];

            const myLabels = ['Media Malaria', 'Media Tuberculosis', 'Media VIH/SIDA', 'Media Cólera'];
            const myValues = [avgMalaria, avgTuberculosis, avgHiv, avgCholera];

            cruceExitoso = true;
            setTimeout(() => renderRadarChart(myLabels.concat(extLabels), myValues.concat(extValues), extLabels.length), 50);
            
            loading = false;
        } catch (e) {
            errorMsg = "Error crítico al intentar realizar el cruce de datos.";
            loading = false;
        }
    }

    function renderRadarChart(allLabels, allValues, extCount) {
        if (!chartCanvas) return;
        if (myChart) myChart.destroy();

        const backgroundColors = allLabels.map((_, index) => 
            index < (allLabels.length - extCount) ? 'rgba(52, 152, 219, 0.6)' : 'rgba(243, 156, 18, 0.6)'
        );
        const borderColors = allLabels.map((_, index) => 
            index < (allLabels.length - extCount) ? 'rgba(41, 128, 185, 1)' : 'rgba(211, 84, 0, 1)'
        );

        const logData = allValues.map(v => v === 0.1 ? 0 : Math.log10(v + 1));

        myChart = new Chart(chartCanvas, {
            type: 'radar', 
            data: {
                labels: allLabels,
                datasets: [{
                    label: `Métricas para ${selectedCountry}`,
                    data: logData, 
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    pointBackgroundColor: borderColors,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: borderColors,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: {
                            display: false 
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let index = context.dataIndex;
                                let valorOriginal = allValues[index]; 
                                
                                if (valorOriginal === 0.1) return ' 0';
                                
                                let formated = valorOriginal % 1 !== 0 
                                    ? valorOriginal.toFixed(2) 
                                    : new Intl.NumberFormat('es-ES').format(valorOriginal);
                                    
                                return ` ${formated}`;
                            }
                        }
                    }
                }
            }
        });
    }

    onMount(initData);
</script>

<main>
    <h2>Pandemias vs Lanzamientos Espaciales</h2>
    
    <div>
        <div>
            <a href="/pandemics"><button>Volver a la tabla</button></a>
            <a href="/integrations/pandemics"><button>Volver</button></a>
            <button onclick={loadFernandoData}>
                Cargar BD Space Launches
            </button>
        </div>

        <label>
            <strong>Seleccionar País Común:</strong>
            <select bind:value={selectedCountry} onchange={loadData}>
                {#each commonCountries as c}
                    <option value={c}>{c}</option>
                {/each}
            </select>
        </label>
    </div>

    {#if loading}
        <div>
            <p>Cruzando satélites con enfermedades...</p>
        </div>
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