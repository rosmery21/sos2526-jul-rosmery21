<script>
import { onMount } from "svelte";
import Highcharts from "highcharts";

onMount(async () => {
  const res = await fetch("/api/v2/child-malnutritions");
  const data = await res.json();

  const latest = data.filter(d => d.year === 2020);

  const avg = (k) =>
    latest.reduce((s, d) => s + (d[k] || 0), 0) / latest.length;

  Highcharts.chart("container", {
    chart: { polar: true, type: "line" },
    title: { text: "Global Nutrition Profile" },

    xAxis: {
      categories: ["Stunting", "Wasting", "Overweight", "Underweight"]
    },

    series: [{
      data: [
        avg("stunting_rate"),
        avg("wasting_rate"),
        avg("overweight_rate"),
        avg("underweight_rate")
      ]
    }]
  });
});
</script>

<div id="container" style="height:600px"></div>