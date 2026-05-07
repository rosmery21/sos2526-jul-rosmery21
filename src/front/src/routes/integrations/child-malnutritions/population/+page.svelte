<script>
	// @ts-nocheck
	import { onMount } from 'svelte';

	let loading = $state(true);
	let errorMsg = $state('');

	onMount(async () => {
		try {
			await loadHighcharts();
			await loadData();
		} catch (e) {
			errorMsg = `Error al cargar los datos: ${e}`;
		} finally {
			loading = false;
		}
	});

	function loadHighcharts() {
		return new Promise((resolve, reject) => {
			if (typeof Highcharts !== 'undefined') return resolve();
			const script = document.createElement('script');
			script.src = 'https://code.highcharts.com/highcharts.js';
			script.onload = () => {
				const hm = document.createElement('script');
				hm.src = 'https://code.highcharts.com/modules/heatmap.js';
				hm.onload = resolve;
				hm.onerror = reject;
				document.head.appendChild(hm);
			};
			script.onerror = reject;
			document.head.appendChild(script);
		});
	}

	async function loadData() {
		// Proxy propio → SOS2526-15
		const [malRes, popRes] = await Promise.all([
			fetch('/api/v2/child-malnutritions'),
			fetch('/api/v2/child-malnutritions/integrations/population-densities')
		]);

		if (!malRes.ok) throw new Error('Error al obtener child-malnutritions');
		if (!popRes.ok) throw new Error('Error al obtener population-densities (SOS2526-15)');

		const mal = await malRes.json();
		const pop = await popRes.json();

		// Último dato de stunting por país
		const latestMal = {};
		mal.forEach(d => {
			if (d.stunting_rate && (!latestMal[d.country] || d.year > latestMal[d.country].year))
				latestMal[d.country] = d;
		});

		// Categorías de densidad
		const densityBuckets = ['0-50', '50-200', '200-500', '500+'];
		const stuntingBuckets = ['0-10', '10-20', '20-35', '35+'];

		// Crear matrix 4x4 (densidad x stunting)
		const matrix = Array.from({ length: 4 }, () => Array(4).fill(0));

		Object.values(latestMal).forEach(m => {
			const p = pop.find(x => x.country?.toLowerCase() === m.country?.toLowerCase());
			if (!p) return;

			const density = parseFloat(p.density ?? p.population_density ?? 0);
			const stunting = parseFloat(m.stunting_rate);
			if (isNaN(density) || isNaN(stunting)) return;

			const di = density < 50 ? 0 : density < 200 ? 1 : density < 500 ? 2 : 3;
			const si = stunting < 10 ? 0 : stunting < 20 ? 1 : stunting < 35 ? 2 : 3;
			matrix[di][si]++;
		});

		const seriesData = [];
		for (let x = 0; x < 4; x++) {
			for (let y = 0; y < 4; y++) {
				seriesData.push([x, y, matrix[x][y]]);
			}
		}

		Highcharts.chart('chart-container', {
			chart: { type: 'heatmap', marginTop: 40, marginBottom: 80 },
			title: { text: 'Densidad de Población vs Malnutrición Infantil (Stunting)' },
			subtitle: { text: 'Fuentes: SOS2526-10 (child-malnutritions) · SOS2526-15 (population-densities)' },
			xAxis: {
				categories: densityBuckets,
				title: { text: 'Densidad de población (hab/km²)' }
			},
			yAxis: {
				categories: stuntingBuckets,
				title: { text: 'Tasa de stunting (%)' },
				reversed: false
			},
			colorAxis: {
				min: 0,
				minColor: '#e0f2fe',
				maxColor: '#1e3a5f',
				labels: { format: '{value} países' }
			},
			tooltip: {
				formatter: function () {
					return `<b>Densidad:</b> ${densityBuckets[this.point.x]} hab/km²<br/>` +
						`<b>Stunting:</b> ${stuntingBuckets[this.point.y]}%<br/>` +
						`<b>Países:</b> ${this.point.value}`;
				}
			},
			series: [{
				name: 'Países',
				borderWidth: 1,
				data: seriesData,
				dataLabels: {
					enabled: true,
					color: '#333',
					formatter: function () {
						return this.point.value > 0 ? this.point.value : '';
					}
				}
			}],
			credits: { enabled: false }
		});
	}
</script>

<main>
	<div class="header">
		<button onclick={() => window.history.back()}>← Volver</button>
		<h2>Densidad de Población vs Malnutrición Infantil</h2>
		<p>
			Mapa de calor que muestra cuántos países caen en cada combinación de densidad de población
			(API <b>SOS2526-15</b>, via proxy propio) y tasa de stunting. Cuanto más oscura la celda,
			más países tienen esa combinación de valores.
		</p>
	</div>

	{#if loading}
		<div class="loading">Cargando datos...</div>
	{:else if errorMsg}
		<div class="error">{errorMsg}</div>
	{/if}

	<div id="chart-container" style="width:100%; height:520px;"></div>

	<p class="note">
		Cada celda indica el número de países que tienen esa combinación de densidad de población y tasa de stunting.
		Los datos de densidad provienen de <b>SOS2526-15</b> y los de malnutrición de <b>SOS2526-10</b>.
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
