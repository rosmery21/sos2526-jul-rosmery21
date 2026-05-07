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
		if (!Highcharts.Series.types.packedbubble) {
			await loadScript('https://code.highcharts.com/highcharts-more.js');
			await loadScript('https://code.highcharts.com/modules/packed-bubble.js');
		}
	}

	function normalizeName(name) {
		if (!name) return '';
		return name.toLowerCase().trim().normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
	}

	async function loadData() {
		const [malRes, leRes] = await Promise.all([
			fetch('/api/v2/child-malnutritions'),
			fetch('/api/v2/child-malnutritions/integrations/worldbank-life-expectancy')
		]);

		if (!malRes.ok) throw new Error(`Error HTTP child-malnutritions: ${malRes.status}`);
		if (!leRes.ok) throw new Error(`Error HTTP Life Expectancy: ${leRes.status}`);

		const mal = await malRes.json();
		const le = await leRes.json();

		const latestMal = {};
		mal.forEach(d => {
			if (d.wasting_rate != null && (!latestMal[d.country] || d.year > latestMal[d.country].year))
				latestMal[d.country] = d;
		});

		const malByNorm = {};
		Object.entries(latestMal).forEach(([country, d]) => {
			malByNorm[normalizeName(country)] = d;
		});

		const groups = {
			'Menos de 60 años': [],
			'60 – 70 años': [],
			'70 – 75 años': [],
			'Más de 75 años': []
		};

		le.forEach(l => {
			const m = malByNorm[normalizeName(l.country)];
			if (!m) return;
			const wasting = parseFloat(m.wasting_rate);
			if (isNaN(wasting) || wasting <= 0) return;

			const lv = l.lifeExpectancy;
			const label =
				lv < 60 ? 'Menos de 60 años' :
				lv < 70 ? '60 – 70 años' :
				lv < 75 ? '70 – 75 años' : 'Más de 75 años';

			groups[label].push({ name: l.country, value: +wasting.toFixed(1) });
		});

		const seriesData = Object.entries(groups)
			.filter(([, data]) => data.length > 0)
			.map(([name, data]) => ({ name, data }));

		if (seriesData.length === 0) throw new Error('No hay datos suficientes para el gráfico.');

		Highcharts.chart('chart-container', {
			chart: { type: 'packedbubble', height: '80%' },
			title: { text: 'Esperanza de Vida vs Wasting Infantil por País' },
			subtitle: { text: 'Cada burbuja = un país. Tamaño = tasa de wasting. Grupo = franja de esperanza de vida.' },
			tooltip: {
				useHTML: true,
				formatter: function () {
					return `<b>${this.point.name}</b><br/>Wasting: <b>${this.point.value}%</b>`;
				}
			},
			plotOptions: {
				packedbubble: {
					minSize: '20%',
					maxSize: '150%',
					zMin: 0,
					zMax: 25,
					layoutAlgorithm: {
						gravitationalConstant: 0.05,
						splitSeries: true,
						seriesInteraction: false,
						dragBetweenSeries: true,
						parentNodeLimit: true
					},
					dataLabels: {
						enabled: true,
						format: '{point.name}',
						filter: { property: 'y', operator: '>', value: 4 },
						style: { color: 'white', textOutline: 'none', fontWeight: 'normal', fontSize: '9px' }
					}
				}
			},
			series: seriesData,
			credits: { enabled: false }
		});
	}
</script>

<main>
	<div class="header">
		<button onclick={() => window.history.back()}>← Volver</button>
		<h2>Esperanza de Vida vs Wasting Infantil</h2>
		<p>
			Gráfico de <b>burbujas agrupadas (Packed Bubble)</b>. Cada burbuja representa un país agrupado
			según su franja de esperanza de vida (World Bank, via proxy propio). El tamaño indica la tasa de
			<b>wasting</b> infantil: burbujas grandes = más malnutrición aguda.
		</p>
	</div>

	{#if loading}
		<div class="loading">Cargando datos...</div>
	{:else if errorMsg}
		<div class="error">{errorMsg}</div>
	{/if}

	<div id="chart-container" style="width:100%; height:600px;"></div>

	<p class="note">
		Los países con menor esperanza de vida tienden a mostrar burbujas más grandes (mayor wasting).
		Datos de esperanza de vida: <b>World Bank</b>. Datos de wasting: <b>SOS2526-10</b>.
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