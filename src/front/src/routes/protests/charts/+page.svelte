<script>
// @ts-nocheck
import Highcharts from 'highcharts';
import {onMount} from 'svelte';
import { goto } from '$app/navigation';

const API = 'http://localhost:3000/api/v2/protests';

async function cargarGrafica() {
// Simulando la respuesta de la API
const res = await fetch(`${API}`);
			if (!res.ok) {
				console.error("Ha ocurrido un eror")
				return;
			}
			const respuesta = await res.json();
			const apiResponse = Array.isArray(respuesta) ? respuesta : [respuesta];

// Contar el número de datos por país
const countryCount = {};
apiResponse.forEach(item => {
    countryCount[item.country] = (countryCount[item.country] || 0) + 1;
});

// Convertir el objeto en un formato adecuado para Highcharts
const seriesData = Object.entries(countryCount).map(([country, count]) => [country, count]);

// Crear el gráfico
Highcharts.chart('container', {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Número de datos por país'
    },
    xAxis: {
        type: 'category',
        title: {
            text: 'País'
        }
    },
    yAxis: {
        title: {
            text: 'Número de datos'
        }
    },
    series: [{
        name: 'Datos',
        data: seriesData
    }]
});
};

onMount(() => {
    cargarGrafica();
});
</script>
<button onclick={goto('/protests')}>Volver</button>
<div id="container"></div>