<script>
	// @ts-nocheck
	import Highcharts from 'highcharts';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	const API = '/api/v2/protests';

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
		const data = await loadData();
		if (!data) return;
		// Contar el número de datos por país
		const countryCount = {};
		data.forEach((item) => {
			countryCount[item.country] = (countryCount[item.country] || 0) + 1;
		});
		// Convertir el objeto en un formato adecuado para Highcharts
		const seriesData = Object.entries(countryCount)
			.map(([country, count]) => ({ name: country, y: count }))
			.sort((a, b) => b.y - a.y); // Ordenar de mayor a menor

		Highcharts.chart('container', {
			chart: {
				type: 'column'
			},
			title: {
				text: 'Número de datos por país'
			},
			xAxis: {
				title: {
					text: 'País'
				}
			},
			yAxis: {
				title: {
					text: 'Número de datos'
				}
			},
			series: [
				{
					name: 'Datos',
					data: seriesData // [{name: 'España', y: 10}, ...]
				}
			]
		});
		showGraph = true;
		graphMode = 'general';
	}

	async function showCountryGraph() {
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
