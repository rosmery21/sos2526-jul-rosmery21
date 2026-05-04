<script>
	// @ts-nocheck
	/* eslint-disable no-undef */

	import { onMount } from 'svelte';

	let countries = $state([]);
	let selectedCountry = $state('Spain');
	let gdpData = $state([]);
	let loading = $state(true);
	let errorMsg = $state('');

	onMount(async () => {
    try {
        await loadHighcharts();
        await loadCountries();
        await loadGDP();
    } catch (e) {
        errorMsg = `Error al conectar con el servidor central. ${e}`;
    } finally {
        loading = false;
    }
});

	async function loadHighcharts() {
		if (typeof Highcharts === 'undefined') {
			await loadScript('https://code.highcharts.com/highcharts.js');
		}

		if (!Highcharts.Series.types.variwide) {
			await loadScript('https://code.highcharts.com/modules/variwide.js');
		}
	}

	function loadScript(src) {
		return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = src;
			script.onload = resolve;
			script.onerror = reject;
			document.head.appendChild(script);
		});
	}

	async function loadCountries() {
		try {
			const res = await fetch(
				'/api/v2/deaths-by-risk-factors/integrations/worldbank-gdp/countries'
			);
			if (!res.ok) return;
			const data = await res.json();
			const arr = Array.isArray(data) ? data : [data];
			countries = [...new Set(arr.map((d) => d.name))].filter((n) => n).sort();
		} catch (err) {
			console.error('Error al cargar los paises', err);
		}
	}

	async function loadGDP() {
		loading = true;
		errorMsg = '';
		try {
			const res = await fetch(
				`/api/v2/deaths-by-risk-factors/integrations/worldbank-gdp?country=${encodeURIComponent(selectedCountry)}`
			);
			if (res.ok) {
				const result = await res.json();
				if (Array.isArray(result) && result.length > 0) {
					gdpData = result.filter((d) => d.value !== null).reverse();
					renderChart();
				} else {
					errorMsg = 'No hay datos disponibles para este país.';
					gdpData = [];
				}
			} else {
				errorMsg = 'Error al obtener los datos del PIB.';
			}
		} catch (err) {
			errorMsg = `Error en la comunicación con la API. ${err}`;
		} finally {
			loading = false;
		}
	}

	function renderChart() {
		if (typeof Highcharts !== 'undefined' && gdpData.length > 0) {
			const variwideSeries = gdpData.map((d) => [d.date, d.value, d.value]);

			Highcharts.chart('chart-variwide', {
				chart: { type: 'variwide' },
				title: { text: `Análisis del PIB: ${selectedCountry}` },
				subtitle: { text: 'El ancho de columna representa el volumen del PIB' },
				xAxis: { type: 'category', title: { text: 'Años' } },
				yAxis: { title: { text: 'PIB (US$ actuales)' } },
				legend: { enabled: false },
				series: [
					{
						name: 'PIB Anual',
						data: variwideSeries,
						dataLabels: { enabled: true, format: '{point.y:,.0f}' },
						colorByPoint: true
					}
				]
			});
		}
	}
</script>

<svelte:head>
	<script src="https://code.highcharts.com/highcharts.js"></script>
	<script src="https://code.highcharts.com/modules/variwide.js" onload={renderChart}></script>
</svelte:head>

<main class="container mt-4 mb-5">
	<div>
		<div>
			<h2>Indicadores Económicos Mundiales</h2>
			<p>Visualización Variwide Chart</p>
		</div>
	</div>

	<div>
		<button class="btn btn-secondary" onclick={() => window.history.back()}> Volver </button>
	</div>

	{#if errorMsg}
		<div class="alert alert-danger">{errorMsg}</div>
	{/if}

	<div class="row justify-content-center mb-4">
		<div class="col-md-8 card shadow-sm p-4 bg-light">
			<label for="countrySelect" class="form-label fw-bold">Seleccionar País:</label>
			<div class="input-group">
				<select
					id="countrySelect"
					class="form-select"
					bind:value={selectedCountry}
					onchange={loadGDP}
				>
					{#each countries as name (name)}
						<option value={name}>{name}</option>
					{/each}
				</select>
				{#if loading}
					<span class="input-group-text bg-white">
						<div class="spinner-border spinner-border-sm text-primary" role="status"></div>
					</span>
				{/if}
			</div>
		</div>
	</div>

	<div
		id="chart-variwide"
		class="border rounded shadow-sm bg-white"
		style="width:90%; height:550px;"
	></div>

	<p>
		En esta gráfica podemos ver la evolucion del PIB del país seleccionado durante los últimos años.
		Cuanto más ancha sea la columna del año, mayor será el volumen del PIB del país indicado en ese
		año.
	</p>
</main>

<style>
	#chart-variwide {
		padding: 10px;
		min-height: 400px;
	}
</style>
