<script>
// @ts-nocheck
import Highcharts from 'highcharts';
import { onMount } from 'svelte';

let selectedYear = $state(2020);
let availableYears = $state([]);
let chartData = $state({});
let loading = $state(true);

async function loadData() {
    loading = true;
    chartData = {};
    const yearsSet = new Set();

    try {
        const res = await fetch('/api/v2/child-malnutritions?limit=1000');
        if (res.ok) {
            const data = await res.json();
            const apiResponse = Array.isArray(data) ? data : [data];

            apiResponse.forEach(item => {
                const year = item.year;
                if (year) yearsSet.add(year);
            });

            const countByRegion = {};
            apiResponse.forEach(item => {
                const region = item.region;
                if (region) {
                    countByRegion[region] = (countByRegion[region] || 0) + 1;
                }
            });

            chartData['Child Malnutritions'] = countByRegion;
        }
    } catch (error) {
        console.error('Error loading child-malnutritions:', error);
    }

    availableYears = [...yearsSet].sort((a, b) => a - b);
    loading = false;
}

onMount(async () => {
    await loadData();
    renderChart();
});

function renderChart() {
    const categories = Object.keys(chartData['Child Malnutritions'] || {});
    const values = categories.map(k => chartData['Child Malnutritions'][k]);

    Highcharts.chart('analytics-chart', {
        chart: { type: 'bar' },
        title: { text: 'Child Malnutritions por Región' },
        xAxis: { categories },
        yAxis: { title: { text: 'Número de registros' } },
        series: [{ name: 'Child Malnutritions', data: values }]
    });
}
</script>

<main>
    <h1>Analytics - Child Malnutritions</h1>
    {#if loading}
        <p>Cargando datos...</p>
    {:else}
        <div id="analytics-chart" style="width:100%;height:400px;"></div>
    {/if}
</main>
