<script>
    import { onMount } from 'svelte';
    import Highcharts from 'highcharts';

    let chartContainer;
    let loading = $state(true);
    let errorMsg = $state("");
    let externalApiWarning = $state(""); 
    let cruceExitoso = $state(false); 
    
    let allMyData = [];
    let countries = $state([]);
    let selectedCountry = $state("");
    let yearsRange = $state("");

    async function initData() {
        loading = true; 
        errorMsg = "";  
        try {
            const resMyApi = await fetch('/api/v2/pandemics?limit=20000');
            if (!resMyApi.ok) throw new Error("Fallo al conectar con tu API local");
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
            const years = countryRecords.map(d => d.year);
            yearsRange = `${Math.min(...years)} - ${Math.max(...years)}`;

            let totalM = 0, countM = 0, totalT = 0, countT = 0;
            let totalH = 0, countH = 0, totalC = 0, countC = 0;

            countryRecords.forEach(r => {
                if (r.malaria != null) { totalM += r.malaria; countM++; }
                if (r.tuberculosis != null) { totalT += r.tuberculosis; countT++; }
                if (r.hiv_aids != null) { totalH += r.hiv_aids; countH++; }
                if (r.cholera != null) { totalC += r.cholera; countC++; }
            });

            const avgMalaria = countM > 0 ? (totalM / countM) : 0;
            const avgTuberculosis = countT > 0 ? (totalT / countT) : 0;
            const avgHiv = countH > 0 ? (totalH / countH) : 0;
            const avgCholera = countC > 0 ? (totalC / countC) : 0;
            
            const resExtApi = await fetch(`/api/v2/pandemics/integrations/covid?country=${encodeURIComponent(selectedCountry)}`); 
            const extData = await resExtApi.json();

            if (extData.error) {
                externalApiWarning = extData.error;
                loading = false;
                return;
            }

            const covidDeaths = extData.stats?.totalDeaths || 0;

            const logZeroValue = 0.1;

            const finalHiv = avgHiv === 0 ? logZeroValue : avgHiv;
            const finalTuberculosis = avgTuberculosis === 0 ? logZeroValue : avgTuberculosis;
            const finalMalaria = avgMalaria === 0 ? logZeroValue : avgMalaria;
            const finalCholera = avgCholera === 0 ? logZeroValue : avgCholera;
            const finalCovid = covidDeaths === 0 ? logZeroValue : covidDeaths;

            cruceExitoso = true;
            setTimeout(() => renderHighchart(finalMalaria, finalTuberculosis, finalHiv, finalCholera, finalCovid), 50);
            
            loading = false;
        } catch (e) {
            errorMsg = "Error al realizar el cruce de datos.";
            loading = false;
        }
    }

    function renderHighchart(malaria, tuberculosis, hiv, cholera, covid) {
        if (!chartContainer) return;

        Highcharts.chart(chartContainer, {
            chart: {
                type: 'areaspline', 
                backgroundColor: 'transparent'
            },
            title: {
                text: `Impacto Epidemiológico en ${selectedCountry}`,
                style: { fontWeight: 'bold', fontSize: '20px', color: '#2c3e50' }
            },
            subtitle: {
                text: `Comparativa: COVID-19 (Total) vs Medias Históricas de Pandemias (${yearsRange})`
            },
            xAxis: {
                categories: ['COVID-19', 'VIH/SIDA', 'Tuberculosis', 'Malaria', 'Cólera'],
                labels: { 
                    style: { fontSize: '13px', fontWeight: 'bold' } 
                }
            },
            yAxis: {
                type: 'logarithmic', 
                title: { text: 'Muertes Registradas (Escala Log)' },
                gridLineDashStyle: 'longdash',
                min: 0.1, 
                labels: {
                    formatter: function () {
                        return this.value === 0.1 ? '0' : this.value;
                    }
                }
            },
            legend: {
                enabled: false 
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#ccc',
                formatter: function () {
                    if (this.y === 0.1) {
                        return `<span style="color:${this.color}">\u25CF</span> Muertes: <b>0</b>`;
                    }
                    if (this.y % 1 !== 0) {
                        return `<span style="color:${this.color}">\u25CF</span> Muertes (Media): <b>${Highcharts.numberFormat(this.y, 3)}</b>`;
                    }
                    return `<span style="color:${this.color}">\u25CF</span> Muertes (Total): <b>${Highcharts.numberFormat(this.y, 0)}</b>`;
                }
            },
            plotOptions: {
                areaspline: {
                    fillOpacity: 0.3, 
                    lineWidth: 3,
                    marker: {
                        radius: 7, 
                        lineWidth: 2,
                        lineColor: '#fff' 
                    }
                }
            },
            series: [{
                name: 'Mortalidad',
                color: '#34495e', 
                data: [
                    { y: covid, color: '#e74c3c' },        
                    { y: hiv, color: '#9b59b6' },          
                    { y: tuberculosis, color: '#f1c40f' }, 
                    { y: malaria, color: '#3498db' },      
                    { y: cholera, color: '#2ecc71' }       
                ]
            }],
            credits: {
                enabled: false 
            }
        });
    }

    onMount(initData);
</script>

<main>
    <h2>Pandemias vs COVID-19</h2>
    
    <div>
        <div>
            <a href="/integrations"><button> Volver</button></a>
            <a href="/pandemics"><button>Volver a la tabla</button></a>
        </div>

        <label>
            <strong>Seleccionar País:</strong>
            <select bind:value={selectedCountry} onchange={loadData}>
                {#each countries as c}
                    <option value={c}>{c}</option>
                {/each}
            </select>
        </label>
    </div>

    {#if loading}
        <div>
            <p>Recopilando datos epidemiológicos...</p>
        </div>
    {:else if externalApiWarning}
        <div>
            <strong>Aviso:</strong> {externalApiWarning}
        </div>
    {:else if errorMsg}
        <p>{errorMsg}</p>
    {/if}

    {#if cruceExitoso && !loading}
        <div>
            <div bind:this={chartContainer}></div>
        </div>
    {/if}
</main>