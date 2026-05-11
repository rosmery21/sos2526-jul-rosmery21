<script>
// @ts-nocheck
import Highcharts from 'highcharts';
import { goto } from '$app/navigation';
import { onMount } from 'svelte';

let data = $state([]);
let countries = $state([]);
let selectedCountry = $state('');
let loading = $state(true);
let error = $state(null);

onMount(async () => {
	try {
		await fetch('/api/v2/child-malnutritions/loadInitialData');
		const res = await fetch('/api/v2/child-malnutritions');
		if (!res.ok) throw new Error(await res.text());
		const json = await res.json();
		data = json;
		countries = [...new Set(json.map(d => d.country))].sort();
		loading = false;
		renderGlobalChart(json);
	} catch (e) {
		console.error(e);
		error = e.message;
		loading = false;
	}
});

function renderGlobalChart(chartData = data) {
	const years = [...new Set(chartData.map(d => Number(d.year)))].sort((a, b) => a - b);
	const avg = (year, field) => {
		const vals = chartData
			.filter(d => Number(d.year) === year)
			.map(d => Number(d[field]))
			.filter(v => !isNaN(v));
		if (vals.length === 0) return null;
		return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
	};
	Highcharts.chart('container', {
		chart: { type: 'scatter' },
		title: { text: 'Malnutrición Infantil — Promedio Global' },
		xAxis: { title: { text: 'Año' }, type: 'linear' },
		yAxis: { title: { text: 'Porcentaje (%)' } },
		series: [
			{ name: 'Stunting',    data: years.map(y => [y, avg(y, 'stunting_rate')]) },
			{ name: 'Wasting',     data: years.map(y => [y, avg(y, 'wasting_rate')]) },
			{ name: 'Overweight',  data: years.map(y => [y, avg(y, 'overweight_rate')]) },
			{ name: 'Underweight', data: years.map(y => [y, avg(y, 'underweight_rate')]) }
		]
	});
}

function renderCountryChart(country) {
	const filtered = data.filter(d => d.country === country);
	Highcharts.chart('container', {
		chart: { type: 'scatter' },
		title: { text: 'Malnutrición Infantil — ' + country },
		xAxis: { title: { text: 'Año' }, type: 'linear' },
		yAxis: { title: { text: 'Porcentaje (%)' } },
		series: [
			{ name: 'Stunting',    data: filtered.map(d => [Number(d.year), d.stunting_rate ?? null]) },
			{ name: 'Wasting',     data: filtered.map(d => [Number(d.year), d.wasting_rate ?? null]) },
			{ name: 'Overweight',  data: filtered.map(d => [Number(d.year), d.overweight_rate ?? null]) },
			{ name: 'Underweight', data: filtered.map(d => [Number(d.year), d.underweight_rate ?? null]) }
		]
	});
}

function onCountryChange(e) {
	selectedCountry = e.target.value;
	if (selectedCountry) renderCountryChart(selectedCountry);
	else renderGlobalChart();
}
</script>

<main>
	{#if loading}
		<p>Cargando datos...</p>
	{:else if error}
		<p style="color:red">Error: {error}</p>
	{:else}
		<div class="grid-container">

			<div class="card">
				<h3>Análisis Evolutivo por País</h3>
				<p>Selecciona un país para ver su evolución histórica de los 4 indicadores de malnutrición:</p>

				<select bind:value={selectedCountry} onchange={onCountryChange}>
    <option value="">-- Global (todos los países) --</option>
    {#each countries as c}
        <option value={c}>{c}</option>
    {/each}
</select>

				<button class="primary"
					onclick={() => { if (selectedCountry) renderCountryChart(selectedCountry); else renderGlobalChart(); }}>
					Ver Gráfica {selectedCountry ? 'de ' + selectedCountry : 'Global'}
				</button>
			</div>

			<div class="card">
				<h3>Mapa de Malnutrición Infantil</h3>
				<p>
					Mapa global interactivo con la tasa de stunting por país en el último año disponible.
					El tamaño y color de cada círculo indica la gravedad de la malnutrición.
				</p>
			
				<button class="primary" onclick={() => goto('/analytics/child-malnutritions/map')}>
					Ver Mapa 🗺️
				</button>
			</div>

		</div>
	{/if}

	<div id="container" style="min-height: 400px; margin-top: 20px;"></div>
</main>

<style>
main { padding: 20px; max-width: 1100px; margin: 0 auto; font-family: sans-serif; }
.grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.card { background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.card h3 { margin: 0; color: #1e3a8a; font-size: 1.1rem; }
.card p { margin: 0; color: #6b7280; font-size: 0.9rem; line-height: 1.5; }
select { padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; }
button { padding: 8px 16px; border: 1px solid #000; border-radius: 4px; cursor: pointer; background: white; font-size: 0.9rem; }
button.primary { background: #1e3a8a; color: white; border-color: #1e3a8a; font-weight: bold; }
button.primary:hover { background: #2d4f80; }
@media (max-width: 700px) { .grid-container { grid-template-columns: 1fr; } }
</style>