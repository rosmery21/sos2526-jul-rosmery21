<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	const API = '/api/v2/protests';

	let Highcharts;
	let countries = $state([]);
	let selectedCountry = $state('');
	let showGraph = $state(false);
	let graphMode = $state('general'); // 'general' or 'country'

	async function loadData() {
		const res = await fetch(`${API}`);
		if (!res.ok) {
			console.error('Ha ocurrido un error');
			return;
		}
		const respuesta = await res.json();
		const apiResponse = Array.isArray(respuesta) ? respuesta : [respuesta];
		// get unique countries
		countries = [...new Set(apiResponse.map((item) => item.country))];
		return apiResponse;
	}

	async function showGeneralGraph() {
		if (!Highcharts) return;
		const data = await loadData();
		if (!data) return;
		// Contar el número de datos por país
		const countryCount = {};
		data.forEach((item) => {
			countryCount[item.country] = (countryCount[item.country] || 0) + 1;
		});
		// Convertir el objeto en un formato adecuado para Highcharts
		const seriesData = Object.entries(countryCount)
			.map(([country, count]) => [country, count])
			.sort((a, b) => b[1] - a[1]); // Ordenar de mayor a menor

		Highcharts.chart('container', {
			chart: {
				type: 'column',
				options3d: {
					enabled: true,
					alpha: 15,
					beta: 15,
					depth: 50,
					viewDistance: 25
				}
			},
			xAxis: {
				type: 'category'
			},
			yAxis: {
				title: {
					enabled: false
				}
			},
			tooltip: {
				headerFormat: '<b>{point.key}</b><br>',
				pointFormat: 'Número de protestas: {point.y}'
			},
			title: {
				text: 'Número de protestas por país'
			},
			legend: {
				enabled: false
			},
			plotOptions: {
				column: {
					depth: 25
				}
			},
			series: [{
				data: seriesData,
				colorByPoint: true
			}]
		});
		showGraph = true;
		graphMode = 'general';
	}

	async function showCountryGraph() {
		if (!Highcharts) return;
		if (!selectedCountry) return;
		const data = await loadData();
		if (!data) return;
		const countryData = data.filter((item) => item.country === selectedCountry);
		const yearCount = {};
		countryData.forEach((item) => {
			yearCount[item.year] = (yearCount[item.year] || 0) + 1;
		});
		const seriesData = Object.entries(yearCount).map(([year, count]) => [parseInt(year), count]);

		Highcharts.chart('container', {
			chart: {
				zooming: {
					type: 'x'
				}
			},
			title: {
				text: 'Numero de protestas en ' + selectedCountry + ' por año'
			},
			subtitle: {
				text:
					document.ontouchstart === undefined
						? 'Pulsa en una zona para hacer zoom'
						: 'Arrastra para hacer zoom'
			},
			xAxis: {
				title: {
					text: 'Año'
				}
			},
			yAxis: {
				title: {
					text: 'Numero de protestas'
				}
			},
			legend: {
				enabled: false
			},
			plotOptions: {
				area: {
					marker: {
						radius: 2
					},
					lineWidth: 1,
					color: {
						linearGradient: {
							x1: 0,
							y1: 0,
							x2: 0,
							y2: 1
						},
						stops: [
							[0, 'rgb(199, 113, 243)'],
							[0.7, 'rgb(76, 175, 254)']
						]
					},
					states: {
						hover: {
							lineWidth: 1
						}
					},
					threshold: null
				}
			},

			series: [
				{
					type: 'area',
					name: 'Protestas',
					data: seriesData
				}
			]
		});

		showGraph = true;
		graphMode = 'country';
	}

	onMount(async () => {
		const { default: HC } = await import('highcharts');
		await import('highcharts/highcharts-3d');
		Highcharts = HC;
		await loadData();
	});
</script>

<button onclick={showGeneralGraph}>Mostrar Gráfica General</button>

<select bind:value={selectedCountry}>
	<option value="">Seleccionar País</option>
	{#each countries as country}
		<option value={country}>{country}</option>
	{/each}
</select>

<button onclick={showCountryGraph} disabled={!selectedCountry}>Mostrar Gráfica por País</button>

<div id="container"></div>

<button onclick={goto('/protests')}>Volver</button>
