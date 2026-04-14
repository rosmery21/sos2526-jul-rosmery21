<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	import 'leaflet/dist/leaflet.css';

	import { countryCoords } from '$lib/utils/coordinates.js';
	import { dataIdNames } from '$lib/utils/deaths-by-risk-factors/dataNames.js';

	let mapElement;
	let map;
	let L;

	let dataId = page.params.data;
	let dataName = $derived(dataIdNames.find(o => o.id === dataId)?.label);


	onMount(async () => {
		if (!browser) return;

		L = await import('leaflet');

		if (!map) {
			map = L.map(mapElement, {
				worldCopyJump: true
			}).setView([20, 0], 1.5);

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; OpenStreetMap'
			}).addTo(map);
		}

		try {
			const res = await fetch('/api/v2/deaths-by-risk-factors');
			if (!res.ok) throw new Error('Error al cargar datos');

			const data = await res.json();
			const stats = Array.isArray(data) ? data : [data];

			const latestDataByCountry = stats.reduce((acc, current) => {
				const country = current.entity;

				if ((!acc[country] || current.year > acc[country].year) && current[dataId] !== 0) {
					acc[country] = current;
				}
				return acc;
			}, {});

			const filteredData = Object.values(latestDataByCountry);

			filteredData.forEach(item => {
				const coords = countryCoords[item.entity];

				if (!coords || !item[dataId] || item[dataId] <= 0) return;

				// Escala logarítmica más controlada
				const radius = Math.max(3, Math.log10(item[dataId]) * 4);

				L.circleMarker(coords, {
					radius,
					color: '#e67e22',
					fillColor: '#d35400',
					fillOpacity: 0.6,
					weight: 1
				})
				.addTo(map)
				.bindPopup(`
					<strong>${item.entity}</strong><br>
					Año: ${item.year}<br>
					Muertes: ${item[dataId].toLocaleString()}
				`);
			});

		} catch (err) {
			console.error(err);
		}
	});

	onDestroy(() => {
		if (map) map.remove();
	});
</script>

<main>
	<div class="header">
		<h2>Mapa Global: {dataName}</h2>
		<p>Visualización de datos de muertes por factores de riesgo geolocalizados</p>
	</div>

	<button onclick={() => goto('/analytics/deaths-by-risk-factors')}>
		Volver
	</button>

	<div bind:this={mapElement} id="map"></div>
</main>

<style>
	#map {
		height: 80vh;
		width: 100%;
		border-radius: 10px;
	}
</style>
