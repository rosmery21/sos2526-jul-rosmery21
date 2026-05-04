<script>
// @ts-nocheck

import { onMount } from "svelte";
import * as echarts from "echarts";
import { goto } from "$app/navigation";

let PROTEST_API = "/api/v2/protests";
let COUNTRIES_API =
  "https://restcountries.com/v3.1/all?fields=name,capital,currencies";

let chart;
let chartEl;

let protestData = $state([]);
let countriesData = $state([]);

let countries = $state([]);
let selectedCountry = $state("");

let ready = $state(false);

// ----------------------
// INIT
// ----------------------
onMount(async () => {
  try {
    const [pRes, cRes] = await Promise.all([
      fetch(PROTEST_API),
      fetch(COUNTRIES_API),
    ]);

    protestData = await safeJson(pRes);
    countriesData = await safeJson(cRes);

    console.log("Protest Data:", protestData);
    console.log("Countries Data:", countriesData);

    // extraer lista de países
    countries = countriesData
      .map((c) => c.name?.common)
      .filter(Boolean)
      .sort();

    console.log("Countries list:", countries);

    selectedCountry = countries[0] || "";

    ready = true;
    renderChart();
  } catch (error) {
    console.error("Error in onMount:", error);
  }
});

// ----------------------
// SAFE JSON
// ----------------------
async function safeJson(res) {
  try {
    if (!res.ok) {
      console.error(`API Error: ${res.status} ${res.statusText}`);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return [];
  }
}

// ----------------------
// HELPERS
// ----------------------
function countProtests(country) {
  return protestData.filter((p) => p.country === country).length;
}

function getCurrency(country) {
  const c = countriesData.find((x) => x.name?.common === country);
  if (!c?.currencies) return "N/A";
  return Object.values(c.currencies)[0]?.name || "N/A";
}

function getCapital(country) {
  const c = countriesData.find((x) => x.name?.common === country);
  return c?.capital?.[0] || "N/A";
}

function getTopCountries(limit = 10) {
  const countryProtestCounts = {};
  
  protestData.forEach((p) => {
    if (p.country) {
      countryProtestCounts[p.country] = (countryProtestCounts[p.country] || 0) + 1;
    }
  });

  return Object.entries(countryProtestCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// ----------------------
// CHART
// ----------------------
function renderChart() {
  if (!chartEl) return;

  if (!chart) chart = echarts.init(chartEl);

  const topCountries = getTopCountries(10);
  const protestCount = countProtests(selectedCountry);
  const currency = getCurrency(selectedCountry);
  const capital = getCapital(selectedCountry);
  
  // Asegurar que el país seleccionado esté incluido
  const chartCountries = topCountries.map(item => item.country);
  const chartData = topCountries.map(item => item.count);
  
  // Si el país seleccionado no está en el top 10, agregarlo
  let selectedIndex = chartCountries.indexOf(selectedCountry);
  if (selectedIndex === -1) {
    chartCountries.unshift(selectedCountry);
    chartData.unshift(protestCount);
  }

  // Colores: azul para el país seleccionado, gris para los demás
  const colors = chartCountries.map((country, idx) => 
    country === selectedCountry ? "#667eea" : "#cbd5e0"
  );

  const titleText = `${selectedCountry} • Capital: ${capital} • Moneda: ${currency} • Protestas: ${protestCount}`;

  chart.setOption({
    title: {
      text: titleText,
      left: "center",
      textStyle: {
        fontSize: 14,
        fontWeight: "normal",
      },
    },

    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params) => {
        if (params.length > 0) {
          const data = params[0];
          return `<strong>${data.name}</strong><br/>Protestas: ${data.value}`;
        }
        return "";
      },
    },

    xAxis: {
      type: "value",
      boundaryGap: [0, 0.01],
    },

    yAxis: {
      type: "category",
      data: chartCountries,
    },

    series: [
      {
        name: "Protestas",
        type: "bar",
        data: chartData,
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: (params) => colors[params.dataIndex],
        },
        label: {
          show: true,
          position: "right",
          formatter: "{c}",
        },
      },
    ],

    grid: {
      left: "20%",
      right: "15%",
    },
  });
}



// ----------------------
// UPDATE
// ----------------------
function onCountryChange() {
  renderChart();
}
</script>

<!-- UI -->
<div style="display:flex; justify-content:center; flex-direction:column; align-items:center; margin-top:20px; gap:20px; padding: 20px;">

  <!-- SELECT -->
  <div style="width:100%; max-width:600px;">
    <label style="display:block; margin-bottom:8px; font-weight:bold; color:#333;">
      Selecciona un país:
    </label>
    <select bind:value={selectedCountry} onchange={onCountryChange} style="width:100%; padding:10px; font-size:16px; border:2px solid #667eea; border-radius:4px;">
      {#each countries as c}
        <option value={c}>{c}</option>
      {/each}
    </select>
  </div>

  <!-- CHART -->
  <div bind:this={chartEl} style="width:100%; max-width:1000px; height:550px; background:white; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);"></div>

  <button onclick={() => goto("/integrations/protests")} style="padding:10px 30px; font-size:16px; background:#667eea; color:white; border:none; border-radius:4px; cursor:pointer; margin-top:10px;">
    Volver
  </button>

</div>