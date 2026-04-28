<script>
// @ts-nocheck

  import { onMount } from "svelte";
  import * as echarts from "echarts";

  let PROTEST_API = "/api/v2/protests";
  let DRINK_API = "/api/proxy/social-drinking";

  let years = $state([]);
  let countries = $state([]);

  let selectedYear = $state(undefined);
  let selectedCountry = $state(undefined);

  let liberalScore = $state(null);
  let totalLiter = $state(null);

  let protestChart;
  let drinkChart;

  let protestEl;
  let drinkEl;

  let ready = $state(false);

  let noProtestData = $state(false);
  let noDrinkData = $state(false);

  // 🔹 INIT
  onMount(async () => {
    const [pRes, dRes] = await Promise.all([
      fetch(PROTEST_API),
      fetch(DRINK_API),
    ]);

    const protests = await safeJson(pRes);
    const drinks = await safeJson(dRes);

    const all = [...protests, ...drinks];

    years = [...new Set(all.map((d) => d.year).filter((y) => y > 2016))].sort();
    countries = [...new Set(all.map((d) => d.country))].sort();

    selectedYear = years[0];
    selectedCountry = countries[0];

    ready = true;
  });

  // 🔹 REACTIVE
  $effect(() => {
    if (!ready) return;
    if (!selectedYear || !selectedCountry) return;

    loadData(selectedYear, selectedCountry);
  });

  // 🔹 SAFE JSON
  async function safeJson(res) {
    try {
      return res.ok ? await res.json() : [];
    } catch {
      return [];
    }
  }

  // 🔹 LOAD DATA
  async function loadData(year, country) {
    const pUrl = `${PROTEST_API}?country=${country}&year=${year}`;
    const dUrl = `${DRINK_API}?country=${country}&year=${year}`;

    const [pRes, dRes] = await Promise.all([
      fetch(pUrl),
      fetch(dUrl),
    ]);

    const pData = await safeJson(pRes);
    const dData = await safeJson(dRes);

    // =========================
    // 🔴 PROTESTS
    // =========================
    noProtestData = !pData.length;

    const protestEntry = Array.isArray(pData)
      ? pData.find((d) => d.country === country && d.year === year) || pData[0]
      : pData;

    liberalScore = protestEntry?.liberal_score ?? null;

    // =========================
    // 🟠 DRINKING
    // =========================
    let drinkEntry = null;

    if (Array.isArray(dData)) {
      drinkEntry =
        dData.find(
          (d) => d.country === country && d.year === year
        ) || dData[0];
    } else {
      drinkEntry = dData;
    }

    noDrinkData = !drinkEntry;
    totalLiter = drinkEntry?.total_liter ?? null;

    renderCharts();
  }

  // 🔹 CHARTS
  function renderCharts() {
    if (!protestEl || !drinkEl) return;

    if (!protestChart) protestChart = echarts.init(protestEl);
    if (!drinkChart) drinkChart = echarts.init(drinkEl);

    // 🔵 PROTESTS (0 - 1)
    protestChart.setOption({
      title: { text: "Puntuación liberal", left: "center" },
      series: [
        {
          type: "gauge",
          min: 0,
          max: 1,
          data: [
            {
              value: liberalScore ?? 0,
              name: noProtestData ? "No hay datos" : "",
            },
          ],
        },
      ],
    });

    // 🍺 DRINKING
    drinkChart.setOption({
      title: { text: "Consumo de alcohol", left: "center" },
      series: [
        {
          type: "gauge",
          min: 0,
          max: 15,
          data: [
            {
              value: totalLiter ?? 0,
              name: noDrinkData ? "No hay datos" : "",
            },
          ],
        },
      ],
    });
  }
</script>

<!-- SELECTORES -->
<select bind:value={selectedYear}>
  {#each years as y}
    <option value={y}>{y}</option>
  {/each}
</select>

<select bind:value={selectedCountry}>
  {#each countries as c}
    <option value={c}>{c}</option>
  {/each}
</select>

<!-- CHARTS CENTRADOS -->
<div style="display:flex; justify-content:center; gap:40px; margin-top:20px;">
  <div bind:this={protestEl} style="width:300px;height:300px;"></div>
  <div bind:this={drinkEl} style="width:300px;height:300px;"></div>
</div>