<script>
	// @ts-nocheck
    /* eslint-disable svelte/prefer-svelte-reactivity */
    /* eslint-disable svelte/no-navigation-without-resolve */


	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
    import { goto } from '$app/navigation';

	let dietDataRaw = [];
	let deathData = [];
	let canvas;
	let chart;

	const cleanName = (name) => (name ? name.split(',')[0].trim() : '');

	onMount(async () => {
		try {
			const resDeaths = await fetch('/api/v2/deaths-by-risk-factors');
			deathData = await resDeaths.json();

			const resDiet = await fetch(
				'/api/v2/deaths-by-risk-factors/integrations/cost-of-healthy-diet'
			);
			const dietJson = await resDiet.json();

			// Limpiamos nombres y nos quedamos solo con el año más reciente por país
			const allDiet = dietJson.map((d) => ({
				...d,
				countryClean: cleanName(d.country)
			}));

			const latestByCountry = new Map();
			for (const d of allDiet) {
				const existing = latestByCountry.get(d.countryClean);
				if (!existing || d.year > existing.year) {
					latestByCountry.set(d.countryClean, d);
				}
			}
			dietDataRaw = Array.from(latestByCountry.values());

			if (dietDataRaw.length > 0 && deathData.length > 0) {
				renderChart();
			}
		} catch (e) {
			console.error('Error cargando integración:', e);
		}
	});

	function renderChart() {
		const bubbleData = dietDataRaw
			.map((dietItem) => {
				const countryDeaths = deathData
					.filter((d) => cleanName(d.entity) === dietItem.countryClean)
					.sort((a, b) => b.year - a.year);

				const deathMatch = countryDeaths[0];

				if (deathMatch) {
					return {
						x: dietItem.cost_vegetables_ppp_usd,
						y: deathMatch.high_fasting_plasma_glucose,
						r: dietItem.cost_healthy_diet_ppp_usd * 4,
						country: dietItem.countryClean,
						dietYear: dietItem.year,
						deathYear: deathMatch.year,
						bloodPressure: deathMatch.high_systolic_blood_pressure,
						airPollution: deathMatch.air_pollution
					};
				}
				return null;
			})
			.filter((item) => item !== null);

		if (chart) chart.destroy();

		const ctx = canvas.getContext('2d');
		chart = new Chart(ctx, {
			type: 'bubble',
			data: {
				datasets: [
					{
						label: 'Países (Tamaño = Coste Dieta Total)',
						data: bubbleData,
						backgroundColor: 'rgba(54, 162, 235, 0.5)',
						borderColor: 'rgba(54, 162, 235, 1)'
					}
				]
			},
			options: {
				scales: {
					x: {
						title: { display: true, text: 'Coste Vegetales (PPP USD)' },
						beginAtZero: false
					},
					y: {
						title: { display: true, text: 'Muertes por Glucosa Alta en Ayuno' },
						beginAtZero: false
					}
				},
				plugins: {
					tooltip: {
						callbacks: {
							label: (context) => {
								const d = context.raw;
								return [
									`${d.country}`,
									`Dieta (${d.dietYear}): ${d.x.toFixed(2)} USD vegetales`,
									`Salud (${d.deathYear}): ${d.y.toFixed(0)} muertes glucosa`,
									`Presión arterial: ${d.bloodPressure?.toFixed(0) ?? 'N/A'}`
								];
							}
						}
					}
				}
			}
		});
	}
</script>

<main class="container">
	<h2>Integración: Coste de Alimentos vs. Riesgos de Salud</h2>

    <button onclick={() => goto('/integrations/deaths-by-risk-factors')}>
		Volver
	</button>

	<p>
		Eje X: coste de vegetales (PPP USD) | Eje Y: muertes por glucosa alta en ayuno | Tamaño: coste
		total de dieta saludable.
	</p>

	<div class="chart-container">
		<canvas bind:this={canvas}></canvas>
	</div>
</main>

<style>
	.container {
		padding: 20px;
		font-family: sans-serif;
	}
	.chart-container {
		max-width: 800px;
		margin: 0 auto 40px auto;
		padding: 10px;
		border: 1px solid #eee;
	}
</style>
