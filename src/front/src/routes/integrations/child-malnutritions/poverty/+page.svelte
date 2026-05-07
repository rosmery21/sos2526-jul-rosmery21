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
			const s = document.createElement('script');
			s.src = src;
			s.onload = resolve;
			s.onerror = () => reject(new Error(`No se pudo cargar: ${src}`));
			document.head.appendChild(s);
		});
	}

	async function loadHighchartsWithModules() {
		if (!window.Highcharts) {
			await loadScript('https://code.highcharts.com/highcharts.js');
		}
		// heatmap debe cargarse ANTES que treemap (treemap depende de heatmap para colorAxis)
		if (!Highcharts.Series.types.heatmap) {
			await loadScript('https://code.highcharts.com/modules/heatmap.js');
		}
		if (!Highcharts.Series.types.treemap) {
			await loadScript('https://code.highcharts.com/modules/treemap.js');
		}
	}

	function normalizeName(name) {
		if (!name) return '';
		return name.toLowerCase().trim().normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
	}

	async function loadData() {
		const [malRes, povRes] = await Promise.all([
			fetch('/api/v2/child-malnutritions'),
			fetch('/api/v2/child-malnutritions/integrations/worldbank-poverty')
		]);

		if (!malRes.ok) throw new Error(`Error HTTP child-malnutritions: ${malRes.status}`);
		if (!povRes.ok) throw new Error(`Error HTTP World Bank Poverty: ${povRes.status}`);

		const mal = await malRes.json();
		const pov = await povRes.json();

		const latestMal = {};
		mal.forEach(d => {
			if (d.stunting_rate != null && (!latestMal[d.country] || d.year > latestMal[d.country].year))
				latestMal[d.country] = d;
		});

		const malByNorm = {};
		Object.entries(latestMal).forEach(([country, d]) => {
			malByNorm[normalizeName(country)] = d;
		});

		const combined = pov
			.map(p => {
				const m = malByNorm[normalizeName(p.country)];
				if (!m) return null;
				const stunting = parseFloat(m.stunting_rate);
				const poverty = parseFloat(p.povertyRate);
				if (isNaN(stunting) || isNaN(poverty) || poverty <= 0) return null;
				return { country: p.country, stunting, poverty };
			})
			.filter(Boolean)
			.sort((a, b) => b.poverty - a.poverty)
			.slice(0, 40);

		if (combined.length === 0) throw new Error('No hay datos suficientes para el gráfico.');

		const seriesData = combined.map(d => ({
			name: d.country,
			value: Math.round(d.poverty * 10) / 10,
			colorValue: Math.round(d.stunting * 10) / 10
		}));

		Highcharts.chart('chart-container', {
			colorAxis: {
				minColor: '#c7f2a4',
				maxColor: '#7b1c1c',
				min: 0,
				max: 60
			},
			title: { text: 'Pobreza Extrema vs Malnutrición Infantil — Top 40 países' },
			subtitle: { text: 'Tamaño = tasa de pobreza · Color = tasa de stunting · Fuente: World Bank (via proxy)' },
			tooltip: {
				formatter: function () {
					return `<b>${this.point.name}</b><br/>` +
						`Pobreza: <b>${this.point.value}%</b><br/>` +
						`Stunting: <b>${this.point.colorValue}%</b>`;
				}
			},
			series: [{
				type: 'treemap',
				layoutAlgorithm: 'squarified',
				clip: false,
				data: seriesData,
				dataLabels: {
					enabled: true,
					style: { fontSize: '11px', textOutline: '1px white' }
				}
			}],
			credits: { enabled: false }
		});
	}
</script>

<main>
	<div class="header">
		<button onclick={() => window.history.back()}>← Volver</button>
		<h2>Tasa de Pobreza Extrema vs Malnutrición Infantil</h2>
		<p>
			<b>Treemap</b> de los 40 países con mayor pobreza extrema (World Bank, via proxy propio).
			El <b>tamaño</b> del bloque indica la tasa de pobreza y el <b>color</b> la intensidad del stunting:
			verde claro = poco stunting, rojo oscuro = mucho stunting.
		</p>
	</div>

	{#if loading}
		<div class="loading">Cargando datos...</div>
	{:else if errorMsg}
		<div class="error">{errorMsg}</div>
	{/if}

	<div id="chart-container" style="width:100%; height:580px;"></div>

	<p class="note">
		Indicador de pobreza: población bajo $2.15/día (SI.POV.DDAY · World Bank).
		Los bloques más grandes y más oscuros indican doble vulnerabilidad: alta pobreza y alto stunting.
	</p>
</main>

<style>
main { padding: 24px; max-width: 1000px; margin: 0 auto; }
.header { margin-bottom: 24px; }
h2 { margin: 12px 0 8px; }
p { color: #555; }
.loading { padding: 40px; text-align: center; color: #888; }
.error { padding: 16px; background: #fee2e2; border-radius: 8px; color: #991b1b; margin-bottom: 16px; }
.note { margin-top: 16px; font-size: 0.9rem; color: #555; }
button { padding: 8px 16px; border: none; border-radius: 6px; background: #6b7280; color: white; cursor: pointer; }
button:hover { background: #4b5563; }
</style>