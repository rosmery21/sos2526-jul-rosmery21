<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import 'leaflet/dist/leaflet.css';

	import { countryCoords } from '$lib/utils/coordinates.js';

	let mapElement;
	let map;
	let L;

	onMount(async () => {
		if (!browser) return;

		L = await import('leaflet');

		if (!map) {
			map = L.map(mapElement, {
				worldCopyJump: true
			}).setView([20, 0], 2);

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; OpenStreetMap'
			}).addTo(map);
		}

		try {
			const res = await fetch('/api/v2/deaths-by-risk-factors');
			if (!res.ok) throw new Error('Error al cargar datos');

			const data = await res.json();
			const stats = Array.isArray(data) ? data : [data];

			const latestYear = Math.max(...stats.map(d => d.year));
			const filteredData = stats.filter(d => d.year === latestYear);

			filteredData.forEach(item => {
				const coords = countryCoords[item.entity];

				if (!coords || !item.air_pollution || item.air_pollution <= 0) return;

				// Escala logarítmica más controlada
				const radius = Math.max(3, Math.log10(item.air_pollution) * 4);

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
					Muertes (Aire): ${item.air_pollution.toLocaleString()}
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
		<h1>Mapa Global: Muertes por Contaminación del Aire</h1>
		<p>Visualización de datos geolocalizados desde la API</p>
	</div>

	<div bind:this={mapElement} id="map"></div>
</main>

<style>
	#map {
		height: 80vh;
		width: 100%;
		border-radius: 10px;
	}
</style>
