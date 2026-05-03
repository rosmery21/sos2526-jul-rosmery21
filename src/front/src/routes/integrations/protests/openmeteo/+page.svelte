<script>
// @ts-nocheck

import { onMount, tick } from "svelte";
import * as echarts from "echarts";
import { goto } from "$app/navigation";

let PROTEST_API = "/api/v2/protests";
let GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
let WEATHER_API = "https://archive-api.open-meteo.com/v1/archive";

let chart;
let chartEl;

let protestData = $state([]);
let countries = $state([]);
let selectedCountry = $state("");

let loading = $state(true);

// ----------------------
onMount(async () => {
  try {
    const res = await fetch(PROTEST_API);
    protestData = await res.json();

    countries = [...new Set(protestData.map(p => p.country))].sort();

    await tick();

    selectedCountry = countries[0];
    loading = false;

    await render();
  } catch (error) {
    console.error("Error en onMount:", error);
    loading = false;
  }
});

// ----------------------
function countProtests(country) {
  return protestData.filter(p => p.country === country).length;
}

// ----------------------
async function getCoords(country) {
  try {
    const res = await fetch(`${GEOCODING_API}?name=${country}&count=1`);
    const data = await res.json();

    if (!data.results?.length) {
      console.warn(`No se encontraron coordenadas para ${country}`);
      return null;
    }

    return {
      lat: data.results[0].latitude,
      lon: data.results[0].longitude,
    };
  } catch (error) {
    console.error("Error en getCoords:", error);
    return null;
  }
}

// ----------------------
async function getWeather(lat, lon) {
  try {
    const url =
      `${WEATHER_API}?latitude=${lat}&longitude=${lon}` +
      `&start_date=2020-01-01&end_date=2020-12-31` +
      `&daily=temperature_2m_mean&timezone=auto`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data?.daily?.temperature_2m_mean) {
      console.warn("No se encontraron datos de temperatura");
      return [];
    }

    return data.daily.temperature_2m_mean;
  } catch (error) {
    console.error("Error en getWeather:", error);
    return [];
  }
}

// ----------------------
async function render() {
  if (!selectedCountry || !chartEl) {
    console.warn("render: selectedCountry o chartEl no están disponibles");
    return;
  }

  if (!chart) {
    chart = echarts.init(chartEl);
  }

  const protests = countProtests(selectedCountry);
  const coords = await getCoords(selectedCountry);

  let avgTemp = 0;

  if (coords) {
    const temps = await getWeather(coords.lat, coords.lon);
    if (temps.length > 0) {
      avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    }
  }

  const maxProtests = Math.max(...countries.map(countProtests));

  chart.setOption({
    title: {
      text: `Protestas vs Clima (${selectedCountry})`,
      left: "center",
    },

    tooltip: {},

    radar: {
      indicator: [
        { name: "Protestas", max: maxProtests },
        { name: "Temp media (°C)", max: 40 },
      ],
      shape: "circle",
    },

    series: [
      {
        type: "radar",
        data: [
          {
            value: [protests, avgTemp],
            name: selectedCountry,
            areaStyle: {
              opacity: 0.3,
            },
            lineStyle: {
              width: 2,
            },
            label: {
              show: true,
              formatter: ({ value }) => value,
            },
          },
        ],
      },
    ],
  });
}

// ----------------------
async function onChange() {
  await render();
}
</script>

<div style="display:flex; flex-direction:column; align-items:center; gap:10px; margin-top:20px;">

  {#if loading}
    <p>Cargando...</p>
  {:else}

    <select bind:value={selectedCountry} onchange={onChange}>
      {#each countries as c}
        <option value={c}>{c}</option>
      {/each}
    </select>

    <div bind:this={chartEl} style="width:900px;height:500px;"></div>

    <button onclick={() => goto("/integrations/")}>
      Volver
    </button>

  {/if}

</div>