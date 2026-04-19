<script>
	// @ts-nocheck
	import Highcharts from 'highcharts';
	import { onMount } from 'svelte';

	let loading = $state(true);
	let error = $state(null);
	let selectedCountry = $state('Spain');
	let countries = $state([]);
	let deathsData = $state([]);
	let airQualityHistory = $state([]);
	let statsTotal = $state(0);
	let statsMaxYear = $state('');
	let statsMax = $state(0);

	const DEATHS_API = '/api/v2/deaths-by-risk-factors';
	const AIR_QUALITY_API = '/api/v2/deaths-by-risk-factors/integrations/aqapi';

	async function fetchCountries() {
		try {
			const res = await fetch(`${DEATHS_API}`);
			if (!res.ok) return;
			const data = await res.json();
			const arr = Array.isArray(data) ? data : [data];
			countries = [...new Set(arr.map((d) => d.entity))].sort();
		} catch (e) {
			console.error('Error cargando países:', e);
		}
	}

	async function loadData() {
		loading = true;
		error = null;
		try {
			const [deathsRes, airQualityRes] = await Promise.all([
				fetch(`${DEATHS_API}?country=${encodeURIComponent(selectedCountry)}`),
				fetch(`${AIR_QUALITY_API}?country=${encodeURIComponent(selectedCountry)}`)
			]);

			if (!deathsRes.ok) throw new Error('Error al obtener datos de muertes');
			if (!airQualityRes.ok) throw new Error('Error al obtener datos de calidad del aire');

			const deathsRaw = await deathsRes.json();
			const airRaw = await airQualityRes.json();

			// Procesar muertes (Barras)
			const deaths = (Array.isArray(deathsRaw) ? deathsRaw : [deathsRaw]).sort(
				(a, b) => a.year - b.year
			);
			deathsData = deaths;

			if (deaths.length === 0) {
				error = `No hay datos de mortalidad para "${selectedCountry}".`;
				loading = false;
				return;
			}

			// Estadísticas de mortalidad
			statsTotal = deaths.reduce((s, d) => s + (d.air_pollution || 0), 0);
			const maxItem = deaths.reduce(
				(prev, cur) => (cur.air_pollution > prev.air_pollution ? cur : prev),
				deaths[0]
			);
			statsMax = Math.round(maxItem.air_pollution || 0);
			statsMaxYear = maxItem.year;

			// Procesar Calidad del Aire (Línea Temporal - Indicador AIR_41 de la OMS)
			// Filtramos por Ambos Sexos (SEX_BTSX) y Todas las Causas (GHECAUSE_GHE000000)
			if (airRaw && airRaw.value) {
				airQualityHistory = airRaw.value
					.filter(item => 
						item.Dim1 === 'SEX_BTSX' && 
						item.Dim2 === 'GHECAUSE_GHE000000'
					)
					.map(item => ({
						year: parseInt(item.TimeDim),
						value: Math.round(item.NumericValue)
					}))
					.sort((a, b) => a.year - b.year);
			} else {
				airQualityHistory = [];
			}

			loading = false;
			
			// Renderizar gráfica
			setTimeout(() => {
				renderChart(deaths, airQualityHistory);
			}, 100);

		} catch (e) {
			error = e.message;
			loading = false;
		}
	}

	function renderChart(deaths, airHistory) {
		const categories = deaths.map((d) => d.year);
		
		// Datos de muertes (API propia)
		const seriesDeaths = deaths.map((d) => Math.round(d.air_pollution || 0));

		// Datos de Calidad del Aire (OMS) sincronizados por año
		// Mapeamos los años de la gráfica a los valores encontrados en la API de la OMS
		const seriesAirQuality = categories.map(year => {
			const record = airHistory.find(h => h.year === year);
			return record ? record.value : null; 
		});

		Highcharts.chart('chart-container', {
			chart: { zoomType: 'xy' },
			title: { text: `Evolución de Mortalidad y Calidad del Aire: ${selectedCountry}` },
			subtitle: { text: 'Comparativa: Datos Propios vs Organización Mundial de la Salud' },
			xAxis: [{
				categories: categories,
				crosshair: true
			}],
			yAxis: [
				{ // Eje 0: Muertes (API propia)
					title: { text: 'Muertes (Factores de Riesgo)', style: { color: '#2caffe' } },
					labels: { style: { color: '#2caffe' } }
				}, 
				{ // Eje 1: Muertes (Referencia OMS)
					title: { text: 'Muertes Atribuibles (OMS)', style: { color: '#ff4444' } },
					labels: { style: { color: '#ff4444' } },
					opposite: true
				}
			],
			tooltip: { shared: true },
			legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom', floating: false, backgroundColor: '#FFFFFF' },
			series: [
				{
					name: 'Mortalidad (Datos Propios)',
					type: 'column',
					yAxis: 0,
					data: seriesDeaths,
					color: '#2caffe',
					tooltip: { valueSuffix: ' muertes' }
				},
				{
					name: 'Mortalidad (Tendencia OMS)',
					type: 'spline',
					yAxis: 1,
					data: seriesAirQuality,
					color: '#ff4444',
					marker: { enabled: true },
					dashStyle: 'ShortDot',
					tooltip: { valueSuffix: ' muertes' }
				}
			]
		});
	}

	onMount(async () => {
		await fetchCountries();
		await loadData();
	});
</script>

<section>
	<h2>Integración OMS × Mortalidad Ambiental</h2>
	<p>
		Esta gráfica compara la evolución temporal de los datos de mortalidad por factores de riesgo (nuestra API) 
		con los datos históricos de muertes atribuibles a la contaminación del aire exterior de la <strong>Organización Mundial de la Salud (indicador AIR_41)</strong>.
	</p>

	<div class="controls">
		<label for="country-select">Seleccionar País:</label>
		<select id="country-select" bind:value={selectedCountry} onchange={loadData}>
			{#each countries as country}
				<option value={country}>{country}</option>
			{/each}
		</select>
		<button onclick={loadData} disabled={loading}>
			{loading ? 'Procesando...' : 'Actualizar Gráfica'}
		</button>
	</div>

	{#if error}
		<div class="error-msg">{error}</div>
	{/if}

	<div id="chart-container" style="width: 100%; height: 600px; margin-top: 20px;"></div>

	{#if !loading && !error && deathsData.length > 0}
		<div class="stats-panel">
			<h3>Resumen de Datos — {selectedCountry}</h3>
			<table class="styled-table">
				<thead>
					<tr>
						<th>Indicador</th>
						<th>Valor / Año</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Total muertes acumuladas (Periodo histórico)</td>
						<td>{Math.round(statsTotal).toLocaleString()}</td>
					</tr>
					<tr>
						<td>Año con mayor pico de mortalidad</td>
						<td>{statsMaxYear} ({statsMax.toLocaleString()} muertes)</td>
					</tr>
					{#if airQualityHistory.length > 0}
					<tr>
						<td>Último dato disponible OMS ({airQualityHistory[airQualityHistory.length-1].year})</td>
						<td>{airQualityHistory[airQualityHistory.length-1].value.toLocaleString()} muertes est.</td>
					</tr>
					{/if}
				</tbody>
			</table>
		</div>
	{/if}
</section>

<style>
	.controls { margin: 20px 0; display: flex; gap: 15px; align-items: center; background: #f9f9f9; padding: 15px; border-radius: 8px; }
	.error-msg { color: #d32f2f; background: #ffcdd2; padding: 10px; border-radius: 4px; margin: 10px 0; font-weight: bold; }
	.stats-panel { margin-top: 40px; border-top: 2px solid #eee; padding-top: 20px; }
	.styled-table { width: 100%; border-collapse: collapse; font-family: sans-serif; }
	.styled-table th, .styled-table td { padding: 12px 15px; border: 1px solid #ddd; text-align: left; }
	.styled-table th { background-color: #f4f4f4; }
</style>