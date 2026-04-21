<script>
// @ts-nocheck
import Highcharts from 'highcharts';
import { onMount } from 'svelte';

let data = $state([]);
let countries = $state([]);
let selectedCountry = $state('');
let loading = $state(true);
let error = $state(null);

onMount(async () => {
	try {
		await fetch('/api/v2/child-malnutritions/loadInitialData');
const res = await fetch('/api/v2/child-malnutritions?limit=10000');
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
		const vals = chartData.filter(d => Number(d.year) === Number(year)).map(d => Number(d[field]));
		return vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : 0;
	};
	Highcharts.chart('container', {
		chart: { type: 'area' },
		title: { text: 'Malnutrición Infantil — Promedio Global' },
		xAxis: { categories: years.map(String) },
		yAxis: { title: { text: 'Porcentaje (%)' } },
		series: [
			{ name: 'Stunting',    data: years.map(y => avg(y, 'stunting_rate')) },
			{ name: 'Wasting',     data: years.map(y => avg(y, 'wasting_rate')) },
			{ name: 'Overweight',  data: years.map(y => avg(y, 'overweight_rate')) },
			{ name: 'Underweight', data: years.map(y => avg(y, 'underweight_rate')) }
		]
	});
}

function renderCountryChart(country) {
	const filtered = data.filter(d => d.country === country);
	const years = filtered.map(d => String(d.year));
	Highcharts.chart('container', {
		chart: { type: 'area' },
		title: { text: 'Malnutrición Infantil — ' + country },
		xAxis: { categories: years },
		yAxis: { title: { text: 'Porcentaje (%)' } },
		series: [
			{ name: 'Stunting',    data: filtered.map(d => d.stunting_rate    ?? null) },
			{ name: 'Wasting',     data: filtered.map(d => d.wasting_rate     ?? null) },
			{ name: 'Overweight',  data: filtered.map(d => d.overweight_rate  ?? null) },
			{ name: 'Underweight', data: filtered.map(d => d.underweight_rate ?? null) }
		]
	});
}

function onSelect(e) {
	selectedCountry = e.target.value;
	if (selectedCountry) {
		renderCountryChart(selectedCountry);
	} else {
		renderGlobalChart();
	}
}
</script>

{#if loading}
	<p>Loading...</p>
{:else if error}
	<p style="color:red">Error: {error}</p>
{:else}
	<div>
		<label for="country-select">Elige un país:</label>
		<select id="country-select" onchange={onSelect}>
			<option value="">-- Global (todos los países) --</option>
			{#each countries as c}
				<option value={c}>{c}</option>
			{/each}
		</select>
	</div>
{/if}

<div id="container" style="min-height: 400px;"></div>