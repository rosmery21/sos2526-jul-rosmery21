<script>
// @ts-nocheck
import Highcharts from 'highcharts';
import { onMount } from 'svelte';

const APIs = [
    { name: 'Protests', url: '/api/v2/protests?limit=1000' },
    { name: 'Pandemics', url: '/api/v2/pandemics?limit=1000' },
    { name: 'Deaths by Risk Factors', url: '/api/v2/deaths-by-risk-factors?limit=1000' },
    { name: 'Child Malnutritions', url: '/api/v2/child-malnutritions?limit=1000' }
];

let selectedYear = $state(2020);
let availableYears = $state([]);
let chartData = $state({});
let loading = $state(true);

async function loadAllData() {
    loading = true;
    chartData = {};
    const yearsSet = new Set();

    for (const api of APIs) {
        try {
            const res = await fetch(api.url);
            if (res.ok) {
                const data = await res.json();
                const apiResponse = Array.isArray(data) ? data : [data];

                apiResponse.forEach(item => {
                    const year = item.year;
                    if (year) yearsSet.add(year);
                });

                const countByCountry = {};

                apiResponse.forEach(item => {
                    const country = item.country || item.entity;
                    
                    if (country) {
                        countByCountry[country] = (countByCountry[country] || 0) + 1;
                    }
                });

                chartData[api.name] = countByCountry;
            }
        } catch (error) {
            console.error(`Error loading ${api.name}:`, error);
        }
    }

    availableYears = Array.from(yearsSet).sort((a, b) => a - b);
    if (availableYears.length > 0) {
        selectedYear = availableYears[0];
    }

    renderChart();
}

function renderChart() {
    const countries = new Set();

    Object.values(chartData).forEach(apiData => {
        Object.keys(apiData).forEach(country => countries.add(country));
    });

    const sortedCountries = Array.from(countries).sort().slice(0, 15);

    const series = APIs.map((api, idx) => ({
        name: api.name,
        data: sortedCountries.map(country => chartData[api.name]?.[country] || 0)
    }));

    Highcharts.chart('analytics-container', {
        chart: {
            type: 'column',
            height: 500
        },
        title: {
            text: 'Datos Integrados de Todos los Miembros del Grupo'
        },
        subtitle: {
            text: 'Número total de registros (filas) por país'
        },
        xAxis: {
            categories: sortedCountries,
            crosshair: true,
            title: { text: 'País' }
        },
        yAxis: {
            title: { text: 'Número de Registros' },
            type: 'logarithmic'
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat:
                '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y} registros</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series
    });

    loading = false;
}

onMount(async () => {
    await loadAllData();
});
</script>

<div class="analytics-page">
    <h1>Análisis Integrado</h1>
    <p>Visualización combinada de datos de todos los miembros del grupo</p>

    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
        <button onclick={() => window.location.href = '/analytics/protests'}>Ir a gráfica protestas</button>
        <button onclick={() => window.location.href = '/analytics/pandemics'}>Ir a gráfica pandemias</button>
        <button onclick={() => window.location.href = '/analytics/deaths-by-risk-factors'}>Ir a gráfica factores de riesgo</button>
        <button onclick={() => window.location.href = '/analytics/child-malnutritions'}>Ir a gráfica malnutrición infantil</button>
    </div>

    {#if loading}
        <div class="loading">Cargando datos de las APIs...</div>
    {/if}

    <div id="analytics-container"></div>
</div>