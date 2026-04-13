<script>
	// @ts-nocheck
	import Highcharts from 'highcharts';
	import { onMount, tick } from 'svelte'; // Importamos 'tick'
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	const countryName = page.params.country; 
	let countryData = $state([]);
	let isLoading = $state(true); // Estado para controlar o carregamento

	async function loadCountryData() {
		try {
			const response = await fetch('/api/v2/deaths-by-risk-factors');
			if (response.ok) {
				const allData = await response.json();
				countryData = allData
					.filter((d) => d.entity === countryName)
					.sort((a, b) => a.year - b.year);
				
				isLoading = false; // Dados carregados

				if (countryData.length > 0) {
					// Esperamos que o Svelte atualize o DOM (crie o div do gráfico)
					await tick(); 
					renderChart();
				}
			}
		} catch (error) {
			console.error('Error cargando datos del país:', error);
			isLoading = false;
		}
	}

	function renderChart() {
		// Verificação de segurança: o elemento existe?
		const container = document.getElementById('chart-container');
		if (!container) {
			console.warn("Contenedor de gráfico no encontrado aún.");
			return;
		}

		Highcharts.chart('chart-container', {
			chart: { type: 'area' },
			title: { text: `Análisis de Riesgos: ${countryName}` },
			xAxis: {
				categories: countryData.map((d) => d.year),
				title: { text: 'Año' }
			},
			yAxis: { title: { text: 'Muertes' } },
			series: [
				{ name: 'Presión Arterial', data: countryData.map(d => d.high_systolic_blood_pressure) },
				{ name: 'Contaminación Aire', data: countryData.map(d => d.air_pollution) },
				{ name: 'Desnutrición', data: countryData.map(d => d.child_wasting) },
				{ name: 'Combustibles Sólidos', data: countryData.map(d => d.household_air_pollution_from_solid_fuels) },
				{ name: 'Glucosa', data: countryData.map(d => d.high_fasting_plasma_glucose) }
			]
		});
	}

	onMount(loadCountryData);
</script>

<section>
	<button onclick={() => goto('/deaths-by-risk-factors/chart')}>
		Volver al menú
	</button>
	
	<h2>Datos históricos de {countryName}</h2>

	{#if isLoading}
		<p>Cargando datos...</p>
	{:else if countryData.length === 0}
		<p>No se han encontrado datos para este país.</p>
	{:else}
		<div id="chart-container" style="width: 100%; height: 500px; min-width: 310px;"></div>
	{/if}
</section>