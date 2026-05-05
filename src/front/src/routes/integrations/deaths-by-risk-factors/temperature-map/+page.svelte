<script>
	// @ts-nocheck

	import { onMount } from 'svelte';
	import { countryNameToISO3 } from '$lib/utils/codes/countryNameToISO3';
	import { iso3ToHcKey } from '$lib/utils/codes/iso3ToHcKey.js';
	import { countryCoords } from '$lib/utils/coordinates';

	let loading = $state(true);
	let container;

	async function getTemperatureData() {
		const countriesToFetch = Object.keys(countryCoords);

		const promises = countriesToFetch.map(async (name) => {
			try {
				const [lat, lon] = countryCoords[name];
				const iso3 = countryNameToISO3[name];
				if (!iso3) return null;

				const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
				const res = await fetch(url);

				if (!res.ok) return null;

				const json = await res.json();
				const tempActual = json.current_weather?.temperature;

				if (tempActual !== undefined) {
					const hcKey = iso3ToHcKey[iso3];
					if (hcKey) return [hcKey, tempActual];
				}

				return null;
			} catch {
				return null;
			}
		});

		const results = await Promise.all(promises);
		return results.filter(Boolean);
	}

	onMount(async () => {
		await new Promise((resolve) => setTimeout(resolve, 500));

		const Highcharts = window.Highcharts;
		if (!Highcharts) {
			console.error('Highcharts no cargado');
			loading = false;
			return;
		}

		const topology = await fetch('https://code.highcharts.com/mapdata/custom/world.topo.json').then(
			(r) => r.json()
		);

		const data = await getTemperatureData();

		Highcharts.mapChart(container, {
			chart: {
				map: topology,
				backgroundColor: '#f8f9fa'
			},
			title: { text: 'Último registro de temperatura por país' },
			subtitle: { text: 'Datos obtenidos vía Open-Meteo API' },
			mapNavigation: {
				enabled: true,
				buttonOptions: { verticalAlign: 'bottom' }
			},
			colorAxis: {
				min: -20,
				max: 45,
				stops: [
					[0, '#4575b4'],
					[0.4, '#ffffbf'],
					[1, '#d73027']
				]
			},
			series: [
				{
					data: data,
					joinBy: ['hc-key', 0],
					name: 'Última medición',
					states: { hover: { color: '#a4edba' } },
					tooltip: { valueSuffix: '°C' }
				}
			]
		});

		loading = false;
	});
</script>

<svelte:head>
	<script src="https://code.highcharts.com/maps/highmaps.js"></script>
	<script src="https://code.highcharts.com/maps/modules/exporting.js"></script>
	<script src="https://code.highcharts.com/maps/modules/data.js"></script>
	<script src="https://code.highcharts.com/maps/modules/accessibility.js"></script>
</svelte:head>

<main class="container">
	<div>
		<h2>Temperatura por país</h2>
	</div>
	<div>
		<button class="btn btn-secondary" onclick={() => window.history.back()}> Volver </button>
	</div>

	{#if loading}
		<div>
			<p>Cargando datos climáticos globales...</p>
		</div>
	{/if}

	<div
		bind:this={container}
		id="map-container"
		style="height: 600px; width: 100%; margin: 0 auto;"
	></div>
	<div>
		<p>
			En este mapa podemos ver una representacion de los países del mundo y su último valor de
			temperatura registrado en la api open meteo. En el mapa los paises representados con un tono
			más cálido tienen un temperatura mayor, y los que esta en colores más fríos tienen una menor
			temperatura.
		</p>
	</div>
</main>
