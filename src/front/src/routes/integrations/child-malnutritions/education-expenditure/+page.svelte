<script>
	// @ts-nocheck
	import { onMount } from 'svelte';

	let loading = $state(true);
	let errorMsg = $state('');

	onMount(async () => {
		try {
			await loadHighchartsWithModules();
			await loadData();
		} catch (e) {
			errorMsg = `Error al cargar los datos: ${e.message ?? e}`;
		} finally {
			loading = false;
		}
	});

	function loadScript(src) {
		return new Promise((resolve, reject) => {
			if (document.querySelector(`script[src="${src}"]`)) return resolve();
			const s = document.createElement('script');
			s.src = src; s.onload = resolve;
			s.onerror = () => reject(new Error(`No se pudo cargar: ${src}`));
			document.head.appendChild(s);
		});
	}

	async function loadHighchartsWithModules() {
		if (!window.Highcharts) await loadScript('https://code.highcharts.com/highcharts.js');
		await loadScript('https://code.highcharts.com/highcharts-more.js');
		await loadScript('https://code.highcharts.com/modules/streamgraph.js');
	}

	async function loadData() {
		const [malRes, eduRes] = await Promise.all([
			fetch('/api/v2/child-malnutritions'),
			fetch('/api/v2/child-malnutritions/integrations/education-expenditure')
		]);

		if (!malRes.ok) throw new Error(`Error child-malnutritions: ${malRes.status}`);
		if (!eduRes.ok) throw new Error(`Error education-expenditure World Bank: ${eduRes.status}`);

		const mal = await malRes.json();
		const eduRaw = await eduRes.json();
		const eduEntries = eduRaw[1] || [];

		// Normalizar nombres
		function normName(name) {
			if (!name) return '';
			return name.toLowerCase().trim()
				.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
				.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
		}

		// Mapa de gasto educativo por país y año
		const eduMap = {};
		eduEntries.forEach(e => {
			if (!e.value) return;
			const country = normName(e.country.value);
			if (!eduMap[country]) eduMap[country] = {};
			eduMap[country][parseInt(e.date)] = parseFloat(e.value);
		});

		// Agrupar países por región de stunting usando malnutrición
		const latestMal = {};
		mal.forEach(d => {
			if (d.stunting_rate && (!latestMal[d.country] || d.year > latestMal[d.country].year))
				latestMal[d.country] = d;
		});

		// Definir 5 "regiones" de stunting y calcular gasto medio educativo por año
		const regions = {
			'Stunting crítico (>40%)': { range: [40, 100], data: {} },
			'Stunting alto (30-40%)': { range: [30, 40], data: {} },
			'Stunting medio (20-30%)': { range: [20, 30], data: {} },
			'Stunting bajo (10-20%)': { range: [10, 20], data: {} },
			'Stunting mínimo (<10%)': { range: [0, 10], data: {} }
		};

		const years = [];
		for (let y = 2005; y <= 2022; y++) years.push(y);

		Object.entries(latestMal).forEach(([country, m]) => {
			const stunting = parseFloat(m.stunting_rate);
			if (isNaN(stunting)) return;
			const normCountry = normName(country);
			const eduData = eduMap[normCountry];
			if (!eduData) return;

			const region = Object.entries(regions).find(([, r]) => stunting >= r.range[0] && stunting < r.range[1]);
			if (!region) return;

			years.forEach(y => {
				if (eduData[y] == null) return;
				if (!region[1].data[y]) region[1].data[y] = [];
				region[1].data[y].push(eduData[y]);
			});
		});

		// Construir series: media de gasto educativo por año para cada franja de stunting
		const colors = ['#dc2626', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
		const series = Object.entries(regions).map(([name, r], i) => ({
			name,
			color: colors[i],
			data: years.map(y => {
				const vals = r.data[y] ?? [];
				return vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : null;
			})
		})).filter(s => s.data.some(v => v !== null));

		if (series.length === 0) throw new Error('No hay datos suficientes para el streamgraph.');

		Highcharts.chart('chart-container', {
			chart: { type: 'streamgraph', marginBottom: 30, zoomType: 'x' },
			title: { text: 'Gasto en Educación por Franja de Stunting (2005–2022)' },
			subtitle: { text: 'Media del % PIB destinado a educación · Fuente: World Bank (via proxy propio)' },
			xAxis: {
				maxPadding: 0,
				type: 'category',
				crosshair: true,
				categories: years.map(String),
				labels: {
					align: 'left',
					reserveSpace: false,
					rotation: 270
				},
				lineWidth: 0,
				margin: 20,
				tickWidth: 0
			},
			yAxis: {
				visible: false,
				startOnTick: false,
				endOnTick: false
			},
			legend: {
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'middle'
			},
			tooltip: {
				shared: true,
				formatter: function () {
					const year = years[this.x];
					let s = `<b>Año ${year}</b><br/>`;
					this.points?.forEach(p => {
						s += `<span style="color:${p.color}">●</span> ${p.series.name}: <b>${p.y?.toFixed(2)}% PIB</b><br/>`;
					});
					return s;
				}
			},
			plotOptions: {
				series: {
					label: { minFontSize: 5, maxFontSize: 15, style: { color: '#ffffff' } },
					accessibility: { exposeAsGroupOnly: true }
				}
			},
			series,
			credits: { enabled: false }
		});
	}
</script>

<main>
	<div class="header">
		<button onclick={() => window.history.back()}>← Volver</button>
		<h2>Gasto en Educación vs Malnutrición Infantil — Streamgraph</h2>
		<p>
			<b>Streamgraph</b> que muestra la evolución temporal (2005–2022) del gasto público en educación
			(% del PIB) agrupado por franja de stunting infantil. Datos del <b>World Bank</b> (via proxy propio).
			¿Invierten más en educación los países con menos malnutrición?
			Puedes hacer zoom arrastrando sobre el gráfico.
		</p>
	</div>

	{#if loading}
		<div class="loading">Cargando datos históricos...</div>
	{:else if errorMsg}
		<div class="error">{errorMsg}</div>
	{/if}

	<div id="chart-container" style="width:100%; height:560px;"></div>

	<div class="legend-extra">
		<span class="dot" style="background:#dc2626"></span> Stunting crítico (&gt;40%) &nbsp;
		<span class="dot" style="background:#f97316"></span> Alto (30-40%) &nbsp;
		<span class="dot" style="background:#eab308"></span> Medio (20-30%) &nbsp;
		<span class="dot" style="background:#22c55e"></span> Bajo (10-20%) &nbsp;
		<span class="dot" style="background:#3b82f6"></span> Mínimo (&lt;10%)
	</div>

	<p class="note">
		Cada flujo representa la media del gasto educativo de los países con ese nivel de stunting.
		Flujos más amplios = más países con datos ese año. Los países con menor stunting tienden
		a invertir más en educación.
	</p>
</main>

<style>
main { padding: 24px; max-width: 1000px; margin: 0 auto; }
.header { margin-bottom: 24px; }
h2 { margin: 12px 0 8px; }
p { color: #555; line-height: 1.5; }
.loading { padding: 40px; text-align: center; color: #888; font-style: italic; }
.error { padding: 16px; background: #fee2e2; border-radius: 8px; color: #991b1b; margin-bottom: 16px; }
.note { margin-top: 16px; font-size: 0.9rem; color: #555; }
button { padding: 8px 16px; border: none; border-radius: 6px; background: #6b7280; color: white; cursor: pointer; }
button:hover { background: #4b5563; }
.legend-extra { margin-top: 16px; font-size: 0.85rem; color: #444; display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; }
</style>