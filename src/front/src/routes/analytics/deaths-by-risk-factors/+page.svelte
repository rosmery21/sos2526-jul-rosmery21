<script>
	// @ts-nocheck
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let countries = $state([]);
	let selectedCountry = $state('');

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
		goto('/analytics/deaths-by-risk-factors/map');
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
			<h3>Mapa de muertes por contaminación del aire</h3>
			<p>Mapa global representando con burbujas las muertes causadas por contaminacióndel aire por país en el último año</p>

			<button class="primary" onclick={goToMapChart}>
				Ver Mapa
			</button>
		</div>
	</div>
</main>
