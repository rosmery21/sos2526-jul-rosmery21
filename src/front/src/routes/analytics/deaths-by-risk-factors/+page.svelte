<script>
	// @ts-nocheck
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	import { dataIdNames } from '$lib/utils/deaths-by-risk-factors/dataNames.js';

	let countries = $state([]);
	let selectedCountry = $state('');
	let selectedMapData = $state('high_systolic_blood_pressure');
	let selectedMapDataName = $derived(dataIdNames.find(o => o.id === selectedMapData)?.label);

	onMount(async () => {
		const res = await fetch('/api/v2/deaths-by-risk-factors');
		if (res.ok) {
			const data = await res.json();
			countries = [...new Set(data.map((d) => d.entity))].sort();
			selectedCountry = countries[0] || '';
		}
	});

	function goToCountryChart() {
		if (selectedCountry) {
			// Navegamos a una ruta dinámica
			goto(`/analytics/deaths-by-risk-factors/by-country/${selectedCountry}`);
		}
	}

	function goToMapChart(){
		goto(`/analytics/deaths-by-risk-factors/map/${selectedMapData}`);
	}
	
</script>

<main>
	<div class="grid-container">
		<div class="card">
			<h3>Análisis Evolutivo por País</h3>
			<p>Selecciona un país para ver su evolución histórica:</p>

			<select bind:value={selectedCountry} onclick={(e) => e.stopPropagation()}>
				{#each countries as country (country)}
					<option value={country}>{country}</option>
				{/each}
			</select>

			<button class="primary" onclick={goToCountryChart} disabled={!selectedCountry}>
				Ver Gráfica de {selectedCountry}
			</button>
		</div>
		<div class="card">
			<h3>Mapa de muertes por {selectedMapDataName}</h3>
			<p>Mapa global representando con burbujas las muertes causadas por el motivo seleccionado en cada país en el último año</p>

			<select bind:value={selectedMapData}>
				{#each dataIdNames as data (data)}
					<option value={data.id}>{data.label}</option>
				{/each}
			</select>

			<button class="primary" onclick={goToMapChart}>
				Ver Mapa
			</button>
		</div>
	</div>
</main>
