<script>
// @ts-nocheck

import { onMount } from "svelte";
import * as echarts from "echarts";
	import { goto } from "$app/navigation";

let PROTEST_API = "/api/v2/protests";
let SPACE_API = "https://meteorite-landings-tvcf.onrender.com/api/v2/meteorite-landings";

let countries = [];
let chart;
let chartEl;
let loading = $state(true);

let protestData = [];
let spaceData = [];

onMount(async () => {
  const [pRes, sRes] = await Promise.all([
    fetch(PROTEST_API),
    fetch(SPACE_API),
  ]);

  protestData = await safeJson(pRes);
  spaceData = await safeJson(sRes);

  const allCountries = [
    ...protestData.map(d => d.country),
    ...spaceData.map(d => d.country),
  ];

  countries = [...new Set(allCountries)].sort();

  console.log("Cargado");
  loading = false;
  renderChart();
});

async function safeJson(res) {
  try {
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

// 📊 media
function avg(arr) {
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function renderChart() {
  if (!chartEl) return;
  if (!chart) chart = echarts.init(chartEl);

  // 🔵 Protest data
  const liberalAvg = countries.map(c =>
    avg(protestData.filter(d => d.country === c).map(d => d.liberal_score))
  );

  const probAvg = countries.map(c =>
    avg(protestData.filter(d => d.country === c).map(d => d.predicted_prob))
  );

  // 🪐 Space data
  const massAvg = countries.map(c =>
    avg(spaceData.filter(d => d.country === c).map(d => d.mass))
  );

  chart.setOption({
    title: {
      text: "Protestas vs Asteroides por país",
      left: "center"
    },
    tooltip: {
      trigger: "axis"
    },
    legend: {
      top: 30
    },

    xAxis: {
      type: "category",
      data: countries,
      axisLabel: {
        rotate: 45
      }
    },

        dataZoom: [
    {
        type: "slider",
        xAxisIndex: 0,
        start: 0,
        end: 40
    },
    {
        type: "inside"
    }
    ],

    yAxis: [
      {
        type: "value",
        name: "Puntuación de protestas (0–1)",
        min: 0,
        max: 1
      },
      {
        type: "value",
        name: "Masa de asteroides",
        position: "right"
      }
    ],

    series: [
      {
        name: "Puntuaje liberal",
        type: "bar",
        data: liberalAvg,
        yAxisIndex: 0
      },
      {
        name: "Probabilidad de éxito",
        type: "bar",
        data: probAvg,
        yAxisIndex: 0
      },
      {
        name: "Masa de asteroides",
        type: "bar",
        data: massAvg,
        yAxisIndex: 1
      }
    ]
  });
}
</script>


{#if loading}
  <p>Cargando...</p>
{/if}

<!-- CHART -->
<div style="display:flex; justify-content:center; margin-top:20px;">
  <div bind:this={chartEl} style="width:900px;height:500px;"></div>
</div>

<button onclick={() => goto('/integrations/protests')}>Volver</button>