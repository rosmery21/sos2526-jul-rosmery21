<script>
	// @ts-nocheck
	import { onMount } from 'svelte';

	let loading = $state(true);
	let errorMsg = $state('');
	let matchCount = $state(0);

	function normalizeName(name) {
		if (!name) return '';
		return name.toLowerCase().trim()
			.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
	}

	onMount(async () => {
		try {
			await loadHighcharts();
			await loadData();
		} catch (e) {
			errorMsg = `Error: ${e.message ?? e}`;
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

	async function loadHighcharts() {
		if (!window.Highcharts) await loadScript('https://code.highcharts.com/highcharts.js');
		await loadScript('https://code.highcharts.com/highcharts-more.js');
	}

	async function loadData() {
		const [malRes, litRes] = await Promise.all([
			fetch('/api/v2/child-malnutritions'),
			fetch('/api/v2/child-malnutritions/integrations/literacy-rates')
		]);
		if (!malRes.ok) throw new Error(`Error child-malnutritions: ${malRes.status}`);
		if (!litRes.ok) throw new Error(`Error literacy-rates SOS2526-11: ${litRes.status}`);

		const mal = await malRes.json();
		const lit = await litRes.json();

		const sample = lit[0] ?? {};
		const allFields = Object.keys(sample);
		const countryField = ['country','Country','entity','Entity','name','Name','location'].find(f => sample[f]) ?? allFields[0];
		const rateField = ['total','literacy_rate','literacyRate','rate','value','Total','literacy','both_sexes','both','percentage','adult_literacy_rate']
			.find(f => sample[f] !== undefined && !isNaN(parseFloat(sample[f])))
			?? allFields.find(f => !isNaN(parseFloat(sample[f])) && f !== countryField && f !== 'year' && f !== 'id');

		if (!rateField) throw new Error(`Campos literacy disponibles: ${allFields.join(', ')}`);

		const latestMal = {};
		mal.forEach(d => {
			if (d.stunting_rate != null && (!latestMal[d.country] || d.year > latestMal[d.country].year))
				latestMal[d.country] = d;
		});

		const litLatest = {};
		lit.forEach(l => {
			const name = normalizeName(String(l[countryField] ?? ''));
			if (!name) return;
			if (!litLatest[name] || (l.year ?? 0) > (litLatest[name].year ?? 0)) litLatest[name] = l;
		});

		const points = [];
		Object.entries(latestMal).forEach(([country, m]) => {
			const l = litLatest[normalizeName(country)];
			if (!l) return;
			const lit_val = parseFloat(l[rateField]);
			const stunting = parseFloat(m.stunting_rate);
			if (isNaN(lit_val) || isNaN(stunting) || lit_val <= 0) return;
			points.push({ country, literacy: lit_val, stunting });
		});

		if (points.length === 0) throw new Error(`Sin coincidencias. Campo país: "${countryField}", campo tasa: "${rateField}".`);

		matchCount = points.length;

		// Top 30 países con más stunting
		const top = points.sort((a, b) => b.stunting - a.stunting).slice(0, 30);

		// Lollipop: columnrange [0, stunting] + scatter marker encima
		// Implementado como columnrange (barra delgada) + scatter (punta)
		Highcharts.chart('chart-container', {
			chart: { inverted: true },
			title: { text: 'Alfabetización vs Stunting — Top 30 países más afectados' },
			subtitle: { text: 'Color del punto = nivel de alfabetización · Fuente: SOS2526-11 + SOS2526-10' },
			xAxis: {
				categories: top.map(p => p.country),
				labels: { style: { fontSize: '10px' } }
			},
			yAxis: {
				title: { text: 'Tasa de stunting (%)' },
				min: 0, max: 65
			},
			tooltip: {
				shared: false,
				formatter: function () {
					const p = top[this.point.x ?? this.point.low !== undefined ? this.x : this.point.x];
					const idx = this.point.x ?? this.x;
					const d = top[idx];
					if (!d) return '';
					return `<b>${d.country}</b><br/>Stunting: <b>${d.stunting.toFixed(1)}%</b><br/>Alfabetización: <b>${d.literacy.toFixed(1)}%</b>`;
				}
			},
			legend: { enabled: false },
			series: [
				{
					// Palo del lollipop
					type: 'columnrange',
					name: 'Stunting',
					data: top.map((p, i) => ({
						x: i,
						low: 0,
						high: p.stunting,
						color: p.literacy < 50 ? '#fca5a5' : p.literacy < 75 ? '#fcd34d' : '#86efac'
					})),
					groupPadding: 0,
					pointWidth: 3,
					borderRadius: 2,
					enableMouseTracking: false
				},
				{
					// Punta del lollipop
					type: 'scatter',
					name: 'Punto',
					data: top.map((p, i) => ({
						x: i,
						y: p.stunting,
						color: p.literacy < 50 ? '#dc2626' : p.literacy < 75 ? '#d97706' : '#16a34a',
						marker: { radius: 9, symbol: 'circle' }
					})),
					tooltip: {
						pointFormatter: function () {
							const d = top[this.x];
							return `<b>${d.country}</b><br/>Stunting: <b>${d.stunting.toFixed(1)}%</b><br/>Alfabetización: <b>${d.literacy.toFixed(1)}%</b>`;
						}
					}
				}
			],
			credits: { enabled: false }
		});
	}
</script>

<main>
	<div class="header">
		<button onclick={() => window.history.back()}>← Volver</button>
		<h2>Alfabetización vs Malnutrición Infantil — Gráfico Lollipop</h2>
		<p>
			Los 30 países con mayor tasa de stunting infantil comparados con su tasa de alfabetización
			(API <b>SOS2526-11</b>, via proxy propio). Cada "palito" representa un país:
			la longitud indica el stunting y el color la alfabetización —
			<span style="color:#dc2626;font-weight:bold">■</span> &lt;50%,
			<span style="color:#d97706;font-weight:bold">■</span> 50–75%,
			<span style="color:#16a34a;font-weight:bold">■</span> &gt;75%.
		</p>
	</div>

	{#if loading}
		<div class="loading">Cargando datos...</div>
	{:else if errorMsg}
		<div class="error"><b>Error:</b> {errorMsg}</div>
	{/if}

	<div id="chart-container" style="width:100%; height:720px;"></div>

	{#if matchCount > 0}
		<p class="note">
			{matchCount} países con datos coincidentes. Mostrados los 30 con mayor stunting.
			Los puntos <b style="color:#dc2626">rojos</b> indican doble vulnerabilidad: alta malnutrición y baja alfabetización.
		</p>
	{/if}
</main>

<style>
main { padding: 24px; max-width: 1000px; margin: 0 auto; }
.header { margin-bottom: 24px; }
h2 { margin: 12px 0 8px; }
p { color: #555; line-height: 1.5; }
.loading { padding: 40px; text-align: center; color: #888; }
.error { padding: 16px; background: #fee2e2; border-radius: 8px; color: #991b1b; margin-bottom: 16px; }
.note { margin-top: 16px; font-size: 0.9rem; color: #555; }
button { padding: 8px 16px; border: none; border-radius: 6px; background: #6b7280; color: white; cursor: pointer; }
button:hover { background: #4b5563; }
</style>