<script>
    // @ts-nocheck
    /* eslint-disable no-undef */

    import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { countryNameToISO3 } from '$lib/utils/countryCodesISO3/countryCodes.js';

	let year = 2017;
	let errorMsg = $state('');
	let Highcharts;

	async function loadSunburst() {
		try {
			const resDeaths = await fetch(`/api/v2/deaths-by-risk-factors?year=${year}`);
			if (!resDeaths.ok) throw new Error('Error cargando muertes');
			const deathsData = await resDeaths.json();

			const resPop = await fetch(
				`https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?date=${year}&format=json&per_page=300`
			);
			const popJson = await resPop.json();
			const populations = popJson[1];

			let sunburstPoints = [{ id: 'world', parent: '', name: `Global ${year}` }];

			deathsData.forEach((d) => {
				const iso = countryNameToISO3[d.entity];

				if (!iso) {
					console.warn('País no mapeado:', d.entity);
					return;
				}

				const popEntry = populations?.find((p) => p.countryiso3code === iso);

				const popValue = popEntry?.value ? popEntry.value.toLocaleString() : 'N/A';

				let deaths_total =
					(d.high_systolic_blood_pressure || 0) +
					(d.air_pollution || 0) +
					(d.child_wasting || 0) +
					(d.household_air_pollution_from_solid_fuels || 0) +
					(d.high_fasting_plasma_glucose || 0);

				if (deaths_total > 0) {
					sunburstPoints.push({
						id: d.entity,
						parent: 'world',
						name: d.entity,
						value: deaths_total,
						popData: popValue,
						color: stringToColor(d.entity)
					});
				}
			});

			if (sunburstPoints.length > 1) {
				renderChart(sunburstPoints);
			} else {
				errorMsg = 'No se encontraron datos para cruzar en el año seleccionado.';
			}
		} catch (e) {
			errorMsg = e.message;
		}
	}

	function stringToColor(str) {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}
		return `hsl(${hash % 360}, 70%, 50%)`;
	}

	function renderChart(data) {
		if (Highcharts && document.getElementById('sunburstContainer')) {
			Highcharts.chart('sunburstContainer', {
				chart: { height: '600px' },
				title: { text: 'Muertes por Riesgo vs Población por País' },
				series: [
					{
						type: 'sunburst',
						data: data,
						allowDrillToNode: true,
						cursor: 'pointer',
						levels: [
							{
								level: 1,
								levelIsConstant: false,
								dataLabels: { 
									rotationMode: 'parallel',
									color: '#ffffff',
									style: { textOutline: '2px contrast black' }
								}
							},
							{
								level: 2,
								dataLabels: {
									color: '#ffffff',
									style: { textOutline: '2px contrast black' }
								}
							}
						],
						tooltip: {
							headerFormat: '',
							pointFormat:
								'País: <b>{point.name}</b><br>Muertes: <b>{point.value}</b><br>Población: <b>{point.popData}</b>'
						}
					}
				]
			});
		}
	}

	onMount(async () => {
		const { default: HC } = await import('highcharts');
		Highcharts = HC;

		// Importar módulos requeridos (treemap es necesario para sunburst)
		await import('highcharts/modules/treemap.js');
		await import('highcharts/modules/sunburst.js');
		
		loadSunburst();
	});
</script>

<main>
	<h2>Integración con World Bank API</h2>

    <button onclick={() => goto('/integrations/deaths-by-risk-factors')}>
		Volver
	</button>
    
	{#if errorMsg}
		<p style="color: red;">{errorMsg}</p>
	{/if}

	<div id="sunburstContainer"></div>

	<section>
		<p>
			En este gráfico podemos ver la cantidad de muertes por factores de risgo de cada pais, y su 
            representación con respecto al total de muertes por factores de riesgo en el mundo, cuanto mayor sea el 
            numero de muertes mayor será la cuña del grafico de ese país. Tambien podemos ver el total de la población
            ese país, pasando el ratón por encima, este dato se ha obtenido de la api worldbank que nos ofrece los datos
            sobre la población de cada país por año, hemos cogido los datos del año ${year} ya que es el último año en 
            nuestra api.
		</p>
	</section>
</main>
