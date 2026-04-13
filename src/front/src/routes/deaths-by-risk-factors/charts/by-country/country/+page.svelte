<script>
	// @ts-nocheck
	import Highcharts from 'highcharts';
	import { onMount } from 'svelte';
	import { page } from '$app/state'; // Para Svelte 5

	// Capturamos el país de la URL: /by-country/Spain -> country = "Spain"
	const country = $page.params.country;
	let countryData = $state([]);

	onMount(async () => {
		const response = await fetch('/api/v2/deaths-by-risk-factors');
		if (response.ok) {
			const allData = await response.json();
			countryData = allData
				.filter(d => d.entity === country)
				.sort((a, b) => a.year - b.year);
			renderChart();
		}
	});

	function renderChart() {
		Highcharts.chart('chart-container', {
			title: { text: `Tendencias de Riesgo: ${country}` },
			xAxis: { categories: countryData.map(d => d.year) },
			series: [
				{ name: 'Contaminación', data: countryData.map(d => d.air_pollution) },
				{ name: 'Presión Arterial', data: countryData.map(d => d.high_systolic_blood_pressure) }
                // Añade el resto de campos aquí...
			]
		});
	}
</script>

<h2>Gráfica Detallada: {country}</h2>
<div id="chart-container"></div>