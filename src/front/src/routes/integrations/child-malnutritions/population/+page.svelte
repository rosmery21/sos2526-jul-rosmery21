<script>
import { onMount } from "svelte";
import Highcharts from "highcharts";

onMount(async () => {
  const [mRes, dRes] = await Promise.all([
    fetch("/api/v2/child-malnutritions"),
    fetch("https://sos2526-15.onrender.com/api/v1/population-densities")
  ]);

  const mal = await mRes.json();
  const dens = await dRes.json();

  const data = mal.map(m => {
    const d = dens.find(x => x.country === m.country);

    return {
      name: m.country,
      x: d?.density || 0,
      y: m.stunting_rate
    };
  });

  Highcharts.chart("container", {
    chart: { type: "bubble" },
    title: { text: "Density vs Malnutrition" },

    xAxis: { title: { text: "Density" } },
    yAxis: { title: { text: "Stunting" } },

    series: [{ data }]
  });
});
</script>

<div id="container" style="height:600px"></div>