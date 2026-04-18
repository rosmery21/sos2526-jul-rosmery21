<script>
  // @ts-nocheck
  import Highcharts from 'highcharts';
  import { onMount } from 'svelte';

  let loading = $state(true);
  let error = $state(null);
  let selectedCountry = $state('Afghanistan');
  let countries = $state([]);
  let openaqInfo = $state(null);
  let deathsData = $state([]);
  let statsTotal = $state(0);
  let statsMaxYear = $state('');
  let statsMax = $state(0);

  const DEATHS_API = '/api/v2/deaths-by-risk-factors';
  const OPENAQ_API = '/api/v2/deaths-by-risk-factors/integrations/openaq';

  async function fetchCountries() {
    try {
      const res = await fetch(`${DEATHS_API}?limit=200`);
      if (!res.ok) return;
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [data];
      countries = [...new Set(arr.map(d => d.entity))].sort();
    } catch (e) {
      console.error('Error cargando países:', e);
    }
  }

  async function loadData() {
    loading = true;
    error = null;

    try {
      const [deathsRes, openaqRes] = await Promise.all([
        fetch(`${DEATHS_API}?country=${encodeURIComponent(selectedCountry)}&limit=100`),
        fetch(OPENAQ_API)
      ]);

      if (!deathsRes.ok) throw new Error('Error al obtener datos de muertes');
      if (!openaqRes.ok) throw new Error('Error al obtener datos de OpenAQ');

      const deathsRaw = await deathsRes.json();
      const openaqRaw = await openaqRes.json();

      const deaths = (Array.isArray(deathsRaw) ? deathsRaw : [deathsRaw])
        .sort((a, b) => a.year - b.year);

      deathsData = deaths;

      if (deaths.length === 0) {
        error = `No hay datos para "${selectedCountry}". Carga los datos iniciales primero.`;
        loading = false;
        return;
      }

      // Estadísticas
      statsTotal = deaths.reduce((s, d) => s + (d.air_pollution || 0), 0);
      const maxItem = deaths.reduce(
        (prev, cur) => (cur.air_pollution > prev.air_pollution ? cur : prev),
        deaths[0]
      );
      statsMax = Math.round(maxItem.air_pollution || 0);
      statsMaxYear = maxItem.year;

      // Info OpenAQ
      let pm25Avg = null;
      let stationsCount = 0;
      let sampleStations = [];

      if (openaqRaw && openaqRaw.results && openaqRaw.results.length > 0) {
        stationsCount = openaqRaw.results.length;
        const pm25Values = openaqRaw.results
          .map(r => r.parameters?.find(p => p.parameter === 'pm25')?.lastValue)
          .filter(v => v != null && v > 0);

        if (pm25Values.length > 0) {
          pm25Avg = pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length;
        }

        sampleStations = openaqRaw.results.slice(0, 5).map(r => ({
          name: r.name || r.locality || 'Desconocida',
          pm25: r.parameters?.find(p => p.parameter === 'pm25')?.lastValue?.toFixed(2) ?? 'N/A'
        }));
      }

      openaqInfo = { pm25Avg, stationsCount, sampleStations };

      loading = false;

      await new Promise(r => setTimeout(r, 50));

      const years = deaths.map(d => d.year);
      const airDeaths = deaths.map(d => Math.round(d.air_pollution || 0));

      // Valor PM2.5 actual como referencia constante en todos los años
      const pm25Line = pm25Avg != null
        ? years.map(() => parseFloat(pm25Avg.toFixed(2)))
        : null;

      Highcharts.chart('chart-openaq', {
        chart: {
          type: 'spline'
        },
        title: {
          text: `Muertes por contaminación del aire — ${selectedCountry}`
        },
        subtitle: {
          text: pm25Avg != null
            ? `PM2.5 actual promedio (OpenAQ): ${pm25Avg.toFixed(2)} µg/m³ · ${stationsCount} estaciones monitorizadas`
            : 'Sin datos PM2.5 disponibles en OpenAQ'
        },
        xAxis: {
          categories: years,
          title: { text: 'Año' },
          crosshair: true
        },
        yAxis: [
          {
            title: { text: 'Muertes por contaminación del aire' },
            min: 0
          },
          {
            title: { text: 'PM2.5 µg/m³ (OpenAQ — valor actual)' },
            opposite: true,
            min: 0
          }
        ],
        tooltip: {
          shared: true,
          headerFormat: '<b>Año {point.key}</b><br/>'
        },
        plotOptions: {
          spline: {
            marker: {
              enabled: true,
              radius: 3
            }
          }
        },
        series: [
          {
            name: 'Muertes por contaminación del aire',
            data: airDeaths,
            yAxis: 0,
            color: '#2caffe',
            tooltip: { valueSuffix: ' muertes' }
          },
          ...(pm25Line ? [{
            name: 'PM2.5 actual (OpenAQ)',
            data: pm25Line,
            yAxis: 1,
            color: '#ff4444',
            dashStyle: 'ShortDash',
            marker: { enabled: false },
            tooltip: { valueSuffix: ' µg/m³' }
          }] : [])
        ],
        credits: { enabled: false }
      });

    } catch (e) {
      error = e.message;
      loading = false;
    }
  }

  onMount(async () => {
    await fetchCountries();
    await loadData();
  });
</script>

<section>
  <h2>Integración OpenAQ × Muertes por calidad del aire</h2>
  <p>
    Combina datos históricos de muertes por contaminación del aire (API propia) con
    mediciones en tiempo real de PM2.5 obtenidas de <strong>OpenAQ</strong>.
  </p>

  <div>
    <label for="country-select">País:</label>
    <select id="country-select" bind:value={selectedCountry} onchange={loadData}>
      {#each countries as country}
        <option value={country}>{country}</option>
      {/each}
    </select>
    <button onclick={loadData} disabled={loading}>
      {loading ? 'Cargando...' : 'Actualizar'}
    </button>
  </div>

  {#if error}
    <p style="color: red;">{error}</p>
  {/if}

  {#if loading}
    <p>Cargando datos...</p>
  {/if}

  <div id="chart-openaq" style="width: 100%; height: 500px; min-width: 310px;"></div>

  {#if !loading && !error && deathsData.length > 0}
    <h3>Estadísticas — {selectedCountry}</h3>
    <table border="1" cellpadding="5">
      <thead>
        <tr>
          <th>Total acumulado (muertes por contaminación)</th>
          <th>Año más letal</th>
          <th>Muertes en año pico</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{Math.round(statsTotal).toLocaleString()}</td>
          <td>{statsMaxYear}</td>
          <td>{statsMax.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>

    {#if openaqInfo && openaqInfo.sampleStations.length > 0}
      <h3>Estaciones OpenAQ (muestra)</h3>
      <table border="1" cellpadding="5">
        <thead>
          <tr>
            <th>Estación</th>
            <th>PM2.5 (µg/m³)</th>
          </tr>
        </thead>
        <tbody>
          {#each openaqInfo.sampleStations as station}
            <tr>
              <td>{station.name}</td>
              <td>{station.pm25}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <p>
        <strong>PM2.5 promedio global (OpenAQ):</strong>
        {openaqInfo.pm25Avg != null ? openaqInfo.pm25Avg.toFixed(2) + ' µg/m³' : 'No disponible'}
        · <strong>Total estaciones:</strong> {openaqInfo.stationsCount}
      </p>

      <h4>Nota metodológica</h4>
      <p>
        Los datos de muertes son históricos (Our World in Data vía API propia).
        El valor de PM2.5 de OpenAQ es el promedio actual de las estaciones disponibles
        y se muestra como referencia en el eje secundario del gráfico.
        Ambas fuentes se complementan: la histórica muestra la tendencia de mortalidad
        y la actual contextualiza la situación presente de calidad del aire.
      </p>
    {/if}
  {/if}
</section>