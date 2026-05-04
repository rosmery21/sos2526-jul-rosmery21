<script>
	import { onMount } from 'svelte';
	import { countryNameToISO3 } from '$lib/utils/countryCodesISO3/countryCodes.js';
	import { countryCoords } from '$lib/utils/coordinates';
	import worldMapData from '@highcharts/map-collection/custom/world.topo.json';

	let loading = true;

	const delay = (ms) => new Promise((res) => setTimeout(res, ms));

	async function getTemperatureData() {
		const results = [];
		const countriesToFetch = Object.keys(countryCoords);
		const delay = (ms) => new Promise((res) => setTimeout(res, ms));

		for (const name of countriesToFetch) {
			try {
				const [lat, lon] = countryCoords[name];
				const iso3 = countryNameToISO3[name];

				if (!iso3) continue;

				const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

				const res = await fetch(url);

				if (res.status === 429) {
					console.warn('Límite alcanzado, mostrando datos parciales.');
					break;
				}

				if (!res.ok) continue;

				const json = await res.json();
				const tempActual = json.current_weather?.temperature;

				if (tempActual !== undefined) {
					results.push([iso3.toUpperCase(), tempActual]);
				}

				await delay(20);
			} catch (e) {
				console.error(`Error en ${name}:`, e);
			}
		}
		return results;
	}

	onMount(async () => {
		const HighchartsModule = await import('highcharts/highmaps');
		const Highcharts = HighchartsModule.default;

		const data = await getTemperatureData();

		const container = document.getElementById('map-container');
		if (container && Highcharts) {
			Highcharts.mapChart('map-container', {
				chart: {
					map: worldMapData,
					backgroundColor: '#f8f9fa'
				},
				title: { text: 'Temperatura Media Anual (2023)' },
				subtitle: { text: 'Datos obtenidos vía Open-Meteo API' },

				mapNavigation: {
					enabled: true,
					buttonOptions: { verticalAlign: 'bottom' }
				},

				colorAxis: {
					min: -20, // Para países en invierno
					max: 45, // Para países en verano
					stops: [
						[0, '#4575b4'], // Frío intenso
						[0.4, '#ffffbf'], // Templado
						[1, '#d73027'] // Calor extremo
					]
				},
				series: [
					{
						data: data,
						joinBy: ['hc-key', 0],
						name: 'Temperatura actual',
						states: {
							hover: { color: '#a4edba' }
						},
						tooltip: {
							valueSuffix: '°C'
						}
					}
				]
			});
		}
		loading = false;
	});
</script>

<main class="container">
	{#if loading}
		<div class="text-center mt-5">
			<p>Cargando datos climáticos globales...</p>
		</div>
	{/if}

	<div id="map-container" style="height: 600px; width: 100%; margin: 0 auto;"></div>

	<div class="info-section mt-4">
		<h3>Análisis de Datos</h3>
		<p>
			Esta integración combina los códigos de países con indicadores climáticos de la API externa
			Open-Meteo.
		</p>
	</div>
</main>

<style>
	.container {
		padding: 20px;
		font-family: sans-serif;
	}
	#map-container {
		background: #f8f9fa;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}
	.info-section {
		background: #e9ecef;
		padding: 15px;
		border-radius: 5px;
	}
</style>
