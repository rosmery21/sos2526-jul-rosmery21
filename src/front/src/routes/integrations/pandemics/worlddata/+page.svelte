<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    let chartCanvas;
    let myChart;
    let loading = $state(true);
    let errorMsg = $state("");
    let countries = $state([]);
    let selectedCountry = $state("Spain");

    async function loadCountries() {
        try {
            const res = await fetch('/api/v2/pandemics?limit=20000');
            const data = await res.json();
            countries = [...new Set(data.map(d => d.entity))].sort();
        } catch (e) { console.error("Error países:", e); }
    }

    async function loadData() {
        loading = true;
        errorMsg = "";
        try {
            // --- 1. TUS DATOS (Medias de 4 enfermedades) ---
            const resMy = await fetch(`/api/v2/pandemics?entity=${selectedCountry}`);
            const myData = await resMy.json();
            
            let mMalaria = 0, mTuberculosis = 0, mSida = 0, mColera = 0;

            if (myData.length > 0) {
                let tM = 0, tT = 0, tS = 0, tC = 0;
                myData.forEach(r => {
                    tM += r.malaria || 0;
                    tT += r.tuberculosis || 0;
                    tS += r.hiv_aids || 0;
                    tC += r.cholera || 0;
                });
                mMalaria = Math.round(tM / myData.length);
                mTuberculosis = Math.round(tT / myData.length);
                mSida = Math.round(tS / myData.length);
                mColera = Math.round(tC / myData.length);
            }

            // --- 2. DATOS EXTERNOS (COVID-19) ---
            const countrySearch = selectedCountry.toLowerCase();
            const resExt = await fetch(`/api/v2/pandemics/integrations/worlddata?country=${countrySearch}`);
            const covidData = await resExt.json();
            
            let covidDeaths = 0;
            if (Array.isArray(covidData) && covidData.length > 0) {
                covidData.forEach(region => {
                    if (region.deaths && typeof region.deaths === 'object') {
                        const values = Object.values(region.deaths);
                        if (values.length > 0) covidDeaths += values[values.length - 1];
                    } else if (typeof region.deaths === 'number') {
                        covidDeaths += region.deaths;
                    }
                });
            }

            loading = false;
            
            // Usamos setTimeout para evitar el error de "context"
            setTimeout(() => {
                renderChart(mMalaria, mTuberculosis, mSida, mColera, covidDeaths);
            }, 100);

        } catch (e) {
            errorMsg = "Error al conectar con las APIs.";
            loading = false;
        }
    }

    function renderChart(malaria, tuberculosis, sida, colera, covid) {
        if (myChart) myChart.destroy();
        
        // Comprobamos si el canvas existe
        if (!chartCanvas) return;

        myChart = new Chart(chartCanvas, {
            type: 'polarArea',
            data: {
                labels: ['Malaria (Media)', 'Tuberculosis (Media)', 'SIDA (Media)', 'Cólera (Media)', 'COVID-19 (Total)'],
                datasets: [{
                    data: [malaria, tuberculosis, sida, colera, covid],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',  
                        'rgba(54, 162, 235, 0.7)',  
                        'rgba(255, 206, 86, 0.7)',  
                        'rgba(153, 102, 255, 0.7)', 
                        'rgba(75, 192, 192, 0.7)'   
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.label}: ${context.raw.toLocaleString()} muertes`
                        }
                    }
                }
            }
        });
    }

    onMount(async () => {
        await loadCountries();
        await loadData();
    });
</script>

<main style="padding:20px; font-family:sans-serif; max-width:900px; margin:auto;">
    <h2 style="text-align:center;">Comparativa Proporcional: {selectedCountry}</h2>
    
    <div style="display:flex; justify-content:space-between; margin-bottom:20px; background:white; padding:15px; border-radius:8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <a href="/integrations/pandemics"><button style="cursor:pointer">Volver</button></a>
        <select bind:value={selectedCountry} onchange={loadData} style="padding:5px">
            {#each countries as c}
                <option value={c}>{c}</option>
            {/each}
        </select>
    </div>

    {#if loading}
        <p style="text-align:center;">Analizando datos...</p>
    {:else if errorMsg}
        <p style="text-align:center; color:red;">{errorMsg}</p>
    {:else}
        <div style="height:550px; background:white; padding:20px; border-radius:12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <canvas bind:this={chartCanvas}></canvas>
        </div>
    {/if}
</main>