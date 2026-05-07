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
			errorMsg = `Error al cargar los datos: ${e.message ?? e}`;
		} finally {
			loading = false;
		}
	});

	function loadHighcharts() {
		return new Promise((resolve, reject) => {
			if (window.Highcharts) return resolve();
			const s = document.createElement('script');
			s.src = 'https://code.highcharts.com/highcharts.js';
			s.onload = resolve;
			s.onerror = () => reject(new Error('No se pudo cargar Highcharts'));
			document.head.appendChild(s);
		});
	}

	async function loadData() {
		// Llamada directa a SOS2526-11 (CORS abierto entre APIs SOS)
		const [malRes, litRes] = await Promise.all([
			fetch('/api/v2/child-malnutritions'),
			fetch('https://sos2526-11.onrender.com/api/v1/literacy-rates')
		]);

		if (!malRes.ok) throw new Error(`Error HTTP child-malnutritions: ${malRes.status}`);
		if (!litRes.ok) throw new Error(`Error HTTP literacy-rates SOS2526-11: ${litRes.status}`);

		const mal = await malRes.json();
		const lit = await litRes.json();

		console.log('🔍 Literacy sample:', JSON.stringify(lit.slice(0, 3), null, 2));
		console.log('🔍 Malnutrition sample:', JSON.stringify(mal.slice(0, 3), null, 2));

		// Último dato de stunting por país
		const latestMal = {};
		mal.forEach(d => {
			if (d.stunting_rate != null && (!latestMal[d.country] || d.year > latestMal[d.country].year))
				latestMal[d.country] = d;
		});

		// Detecta automáticamente el campo de país y el campo de tasa en literacy
		const sampleLit = lit[0] ?? {};
		const allFields = Object.keys(sampleLit);
		console.log('🔍 Campos literacy disponibles:', allFields);

		const countryField = ['country', 'Country', 'entity', 'Entity', 'name', 'Name', 'nation', 'location']
			.find(f => sampleLit[f] !== undefined) ?? allFields[0];

		const rateField = ['total', 'literacy_rate', 'literacyRate', 'rate', 'value', 'Total',
			'literacy', 'adult_literacy_rate', 'both_sexes', 'both', 'percentage', 'pct']
			.find(f => sampleLit[f] !== undefined && !isNaN(parseFloat(sampleLit[f])))
			?? allFields.find(f => !isNaN(parseFloat(sampleLit[f])) && f !== countryField && f !== 'year' && f !== 'id');

		console.log(`🔍 Campo país detectado: "${countryField}", campo tasa detectado: "${rateField}"`);

		if (!rateField) {
			throw new Error(`No se encontró campo numérico de tasa. Campos: ${allFields.join(', ')}`);
		}

		// Mapa normalizado de literacy (toma el más reciente por país)
		const litLatest = {};
		lit.forEach(l => {
			const name = String(l[countryField] ?? '');
			const norm = normalizeName(name);
			if (!norm) return;
			if (!litLatest[norm] || (l.year ?? 0) > (litLatest[norm].year ?? 0)) {
				litLatest[norm] = l;
			}
		});

		// Cruce de datos
		const points = [];
		Object.entries(latestMal).forEach(([country, m]) => {
			const norm = normalizeName(country);
			const l = litLatest[norm];
			if (!l) return;

			const litVal = parseFloat(l[rateField]);
			const stunting = parseFloat(m.stunting_rate);
			if (isNaN(litVal) || isNaN(stunting) || litVal <= 0) return;

			points.push({ name: country, x: litVal, y: stunting });
		});

		matchCount = points.length;
		console.log(`✅ Coincidencias: ${points.length}`);

		if (points.length === 0) {
			const malSample = Object.keys(latestMal).slice(0, 5).join(', ');
			const litSample = lit.slice(0, 5).map(l => l[countryField]).join(', ');
			throw new Error(
				`Sin coincidencias.\nPaíses malnutrición: ${malSample}\nPaíses literacy: ${litSample}\nCampo país: ${countryField}, campo tasa: ${rateField}`
			);
		}

		Highcharts.chart('chart-container', {
			chart: { type: 'scatter', zoomType: 'xy' },
			title: { text: 'Alfabetización vs Malnutrición Infantil (Stunting)' },
			subtitle: { text: 'Fuentes: SOS2526-10 (child-malnutritions) · SOS2526-11 (literacy-rates)' },
			xAxis: {
				title: { text: 'Tasa de alfabetización (%)' },
				min: 0, max: 100
			},
			yAxis: {
				title: { text: 'Tasa de stunting (%)' },
				min: 0
			},
			tooltip: {
				formatter: function () {
					return `<b>${this.point.name}</b><br/>Alfabetización: ${this.x.toFixed(1)}%<br/>Stunting: ${this.y.toFixed(1)}%`;
				}
			},
			plotOptions: {
				scatter: { marker: { radius: 5, states: { hover: { enabled: true } } } }
			},
			series: [{
				name: 'Países',
				color: 'rgba(59, 130, 246, 0.7)',
				data: points
			}],
			credits: { enabled: false }
		});
	}
</script>

<main>
	<div class="header">
		<button onclick={() => window.history.back()}>← Volver</button>
		<h2>Educación vs Malnutrición Infantil</h2>
		<p>
			Comparativa entre la tasa de alfabetización por país (API <b>SOS2526-11</b>)
			y la tasa de stunting infantil. A mayor educación, se espera menor malnutrición.
		</p>
	</div>

	{#if loading}
		<div class="loading">Cargando datos...</div>
	{:else if errorMsg}
		<div class="error">
			<b>Error:</b> {errorMsg}
			<p style="font-size:0.85rem;margin-top:8px;">Abre la consola (F12) para ver los campos de debug.</p>
		</div>
	{/if}

	<div id="chart-container" style="width:100%; height:550px;"></div>

	{#if matchCount > 0}
		<p class="note">
			{matchCount} países con datos coincidentes entre SOS2526-11 y SOS2526-10.
		</p>
	{/if}
</main>

<style>
main { padding: 24px; max-width: 1000px; margin: 0 auto; }
.header { margin-bottom: 24px; }
h2 { margin: 12px 0 8px; }
p { color: #555; }
.loading { padding: 40px; text-align: center; color: #888; }
.error { padding: 16px; background: #fee2e2; border-radius: 8px; color: #991b1b; margin-bottom: 16px; white-space: pre-wrap; }
.note { margin-top: 16px; font-size: 0.9rem; color: #555; }
button { padding: 8px 16px; border: none; border-radius: 6px; background: #6b7280; color: white; cursor: pointer; }
button:hover { background: #4b5563; }
</style>