<script>
// @ts-nocheck

import { onMount, tick } from "svelte";
import * as echarts from "echarts";
import { goto } from "$app/navigation";

let PROTEST_API = "/api/v2/protests";
let WIKIDATA_API = "https://query.wikidata.org/sparql";

let chart;
let chartEl;

let protestData = $state([]);
let govData = $state({});  // { "Kenya": "Presidential republic", ... }

let countries = $state([]);
let selectedCountry = $state("");

let loading = $state(true);
let error = $state(null);

// ----------------------
onMount(async () => {
  try {
    const [protestRes, govMap] = await Promise.all([
      fetch(PROTEST_API).then(r => r.json()),
      fetchGovernmentTypes(),
    ]);

    protestData = protestRes;
    govData = govMap;

    countries = [...new Set(protestData.map(p => p.country))].sort();

    await tick();
    selectedCountry = countries[0];
    loading = false;

    await tick();
    render();
  } catch (err) {
    console.error("Error en onMount:", err);
    error = err.message;
    loading = false;
  }
});

// ----------------------
// Esta consulta obtiene todos los países del mundo (instancias de "country" en Wikidata)
// y recupera su sistema de gobierno asociado mediante la propiedad P122 (legal form of government).
// Luego se usa el servicio de etiquetas de Wikidata para convertir los identificadores internos
// en texto legible (por ejemplo: "Q4198907" → "presidential republic").
// El resultado se usa para agrupar las protestas del dataset según el tipo de sistema político
// de cada país, permitiendo analizar su distribución global.
async function fetchGovernmentTypes() {
  const query = `
  SELECT ?countryLabel ?govLabel WHERE {
    ?country wdt:P31 wd:Q6256.
    ?country wdt:P122 ?gov.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }
  `;

  const res = await fetch(
    WIKIDATA_API + "?query=" + encodeURIComponent(query),
    { headers: { Accept: "application/sparql-results+json" } }
  );

  const data = await res.json();

  // Un país puede tener varios sistemas de gobierno, nos quedamos con el primero
  const map = {};
  for (const d of data.results.bindings) {
    const country = d.countryLabel.value;
    const gov = d.govLabel.value;
    if (!map[country]) map[country] = gov;
  }

  return map;
}

// ----------------------
// Busca el sistema de gobierno con matching flexible
function getGovType(country) {
  if (govData[country]) return govData[country];

  const key = Object.keys(govData).find(k =>
    k.toLowerCase().includes(country.toLowerCase()) ||
    country.toLowerCase().includes(k.toLowerCase())
  );

  return key ? govData[key] : null;
}

// ----------------------
// Distribuye todas las protestas del dataset según el sistema de gobierno de su país
function buildPieData() {
  const counts = {};

  for (const p of protestData) {
    const gov = getGovType(p.country) ?? "Unknown";
    counts[gov] = (counts[gov] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // top 8 para no saturar el gráfico
}

// ----------------------
function render() {
  if (!chartEl) return;
  if (!chart) chart = echarts.init(chartEl);

  const pieData = buildPieData();
  const total = pieData.reduce((acc, d) => acc + d.value, 0);

  chart.setOption({
    title: {
      text: "Protestas por sistema de gobierno",
      subtext: `${total} protestas totales en el dataset`,
      left: "center",
    },

    tooltip: {
      trigger: "item",
      formatter: "{b}<br/>{c} protestas ({d}%)",
    },

    legend: {
      orient: "vertical",
      left: "left",
      top: "middle",
      textStyle: { fontSize: 11 },
    },

    series: [
      {
        type: "pie",
        radius: ["35%", "65%"],
        center: ["62%", "55%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: "{b}\n{d}%",
          fontSize: 11,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0,0,0,0.3)",
          },
        },
        data: pieData,
      },
    ],
  });
}
</script>


<div style="display:flex; flex-direction:column; align-items:center; gap:12px; margin-top:20px;">

  {#if loading}
    <p>Cargando datos...</p>
  {:else if error}
    <p style="color:red;">Error: {error}</p>
  {:else}

    <div bind:this={chartEl} style="width:900px;height:500px;"></div>

    <button onclick={() => goto("/integrations/protests")}>
      Volver
    </button>

  {/if}

</div>