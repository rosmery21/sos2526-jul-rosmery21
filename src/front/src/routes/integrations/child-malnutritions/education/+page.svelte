<script>
import { onMount } from "svelte";
import Highcharts from "highcharts";

onMount(async () => {
  const [mRes, lRes] = await Promise.all([
    fetch("/api/v2/child-malnutritions"),
    fetch("https://sos2526-11.onrender.com/api/v1/literacy-rates")
  ]);

  const mal = await mRes.json();
  const lit = await lRes.json();

  const data = mal.map(m => {
    const l = lit.find(x => x.country === m.country);

    return {
      name: m.country,
      x: l?.total || 0,
      y: m.stunting_rate
    };
  });

  Highcharts.chart("container", {
    chart: { type: "scatter" },
    title: { text: "Education vs Malnutrition" },

    xAxis: { title: { text: "Literacy" } },
    yAxis: { title: { text: "Stunting" } },

    series: [{ data }]
  });
});
</script>

<div id="container" style="height:600px"></div>