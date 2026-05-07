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
			const script = document.createElement('script');
			script.src = src;
			script.onload = resolve;
			script.onerror = () => reject(new Error(`No se pudo cargar: ${src}`));
			document.head.appendChild(script);
		});
	}

	async function loadHighchartsWithModules() {
		if (!window.Highcharts) {
			await loadScript('https://code.highcharts.com/highcharts.js');
		}
		// El módulo waterfall va dentro de highcharts-more o directamente como módulo
		if (!Highcharts.Series.types.waterfall) {
			await loadScript('https://code.highcharts.com/modules/waterfall.js');
		}
	}

	async function loadData() {
		const [malRes, gdpRes] = await Promise.all([
			fetch('/api/v2/child-malnutritions'),
			fetch('/api/v2/child-malnutritions/integrations/worldbank-gdp')
		]);

		if (!malRes.ok) throw new Error(`Error HTTP child-malnutritions: ${malRes.status}`);
		if (!gdpRes.ok) throw new Error(`Error HTTP World Bank GDP: ${gdpRes.status}`);

		const mal = await malRes.json();
		const gdp = await gdpRes.json();

		function normalizeName(name) {
			if (!name) return '';
			return name.toLowerCase().trim().normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
		}

		const latestMal = {};
		mal.forEach(d => {
			if (d.stunting_rate != null && (!latestMal[d.country] || d.year > latestMal[d.country].year))
				latestMal[d.country] = d;
		});

		const malByNorm = {};
		Object.entries(latestMal).forEach(([country, d]) => {
			malByNorm[normalizeName(country)] = d;
		});

		const groups = [
			{ label: 'PIB < 1k',   min: 0,     max: 1000,     stunting: [] },
			{ label: 'PIB 1-5k',   min: 1000,  max: 5000,     stunting: [] },
			{ label: 'PIB 5-15k',  min: 5000,  max: 15000,    stunting: [] },
			{ label: 'PIB 15-40k', min: 15000, max: 40000,    stunting: [] },
			{ label: 'PIB > 40k',  min: 40000, max: Infinity, stunting: [] },
		];

		gdp.forEach(g => {
			const m = malByNorm[normalizeName(g.country)];
			if (!m) return;
			const stunting = parseFloat(m.stunting_rate);
			if (isNaN(stunting) || stunting <= 0) return;
			const grp = groups.find(gr => g.gdpPerCapita >= gr.min && g.gdpPerCapita < gr.max);
			if (grp) grp.stunting.push(stunting);
		});

		const averages = groups.map(g => ({
			label: g.label,
			avg: g.stunting.length
				? +(g.stunting.reduce((a, b) => a + b, 0) / g.stunting.length).toFixed(1)
				: null,
			count: g.stunting.length
		})).filter(g => g.avg !== null);

		if (averages.length < 2) throw new Error('No hay suficientes datos para el gráfico.');

		const seriesData = averages.map((g, i) => {
			if (i === 0) return { name: `${g.label}\n(${g.count} países)`, y: g.avg, color: '#1e40af' };
			const diff = +(g.avg - averages[i - 1].avg).toFixed(1);
			return {
				name: `${g.label}\n(${g.count} países)`,
				y: diff,
				color: diff <= 0 ? '#16a34a' : '#dc2626'
			};
		});
		seriesData.push({ name: 'Nivel final', isSum: true, color: '#7c3aed' });

		Highcharts.chart('chart-container', {
			chart: { type: 'waterfall' },
			title: { text: 'Cambio en Stunting por franja de PIB per cápita' },
			subtitle: { text: 'Fuente: World Bank (via proxy propio) · Verde = baja stunting · Rojo = sube' },
			xAxis: { type: 'category', title: { text: 'Franja de PIB per cápita (USD)' } },
			yAxis: { title: { text: 'Tasa media de stunting (%)' } },
			tooltip: {
				formatter: function () {
					const sign = this.y > 0 ? '+' : '';
					return this.point.isSum
						? `<b>${this.point.name}</b><br/>Total: ${this.total?.toFixed(1)}%`
						: `<b>${this.point.name}</b><br/>Cambio: ${sign}${this.y?.toFixed(1)}%`;
				}
			},
			legend: { enabled: false },
			series: [{
				name: 'Stunting',
				upColor: '#dc2626',
				color: '#16a34a',
				data: seriesData,
				dataLabels: {
					enabled: true,
					formatter: function () {
						const sign = this.y > 0 ? '+' : '';
						return this.point.isSum
							? `${this.total?.toFixed(1)}%`
							: `${sign}${this.y?.toFixed(1)}%`;
					},
					style: { fontWeight: 'bold', fontSize: '11px' }
				},
				pointPadding: 0
			}],
			credits: { enabled: false }
		});
	}
</script>

<main>
	<div class="header">
		<button onclick={() => window.history.back()}>← Volver</button>
		<h2>PIB per cápita vs Malnutrición Infantil</h2>
		<p>
			Gráfico <b>Waterfall</b> que muestra cómo cambia la tasa media de stunting al pasar de una franja
			de PIB per cápita a la siguiente. Datos del PIB: <b>World Bank</b> (via proxy propio).
			Verde = el stunting baja, Rojo = sube.
		</p>
	</div>

	{#if loading}
		<div class="loading">Cargando datos...</div>
	{:else if errorMsg}
		<div class="error">{errorMsg}</div>
	{/if}

	<div id="chart-container" style="width:100%; height:520px;"></div>

	<p class="note">
		A mayor PIB per cápita, se espera menor tasa de stunting. Las barras verdes indican caídas
		en el índice de malnutrición al subir de franja económica.
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