<script>
// @ts-nocheck
import { onMount, onDestroy } from 'svelte';
import { browser } from '$app/environment';

let mapElement;
let map;
let L;
let isLoading = $state(true);
let errorMessage = $state('');

const countryCoords = {
    'Afghanistan': [33.93, 67.70], 'Albania': [41.15, 20.17], 'Algeria': [28.03, 1.66],
    'Angola': [-11.20, 17.87], 'Argentina': [-38.41, -63.61], 'Armenia': [40.06, 45.03],
    'Australia': [-25.27, 133.77], 'Austria': [47.51, 14.55], 'Azerbaijan': [40.14, 47.57],
    'Bangladesh': [23.68, 90.35], 'Belarus': [53.70, 27.95], 'Belgium': [50.50, 4.46],
    'Benin': [9.30, 2.31], 'Bhutan': [27.51, 90.43], 'Bolivia': [-16.29, -63.58],
    'Bosnia and Herzegovina': [43.91, 17.67], 'Botswana': [-22.32, 24.68],
    'Brazil': [-14.23, -51.92], 'Brunei': [4.53, 114.72], 'Bulgaria': [42.73, 25.48],
    'Burkina Faso': [12.23, -1.56], 'Burundi': [-3.37, 29.91], 'Cambodia': [12.56, 104.99],
    'Cameroon': [7.36, 12.35], 'Canada': [56.13, -106.34], 'Central African Republic': [6.61, 20.93],
    'Chad': [15.45, 18.73], 'Chile': [-35.67, -71.54], 'China': [35.86, 104.19],
    'Colombia': [4.57, -74.29], 'Congo': [-0.22, 15.82], 'Costa Rica': [9.74, -83.75],
    'Croatia': [45.10, 15.20], 'Cuba': [21.52, -77.78], 'Cyprus': [35.12, 33.42],
    'Czechia': [49.81, 15.47], 'Denmark': [56.26, 9.50], 'Djibouti': [11.82, 42.59],
    'Dominican Republic': [18.73, -70.16], 'Ecuador': [-1.83, -78.18], 'Egypt': [26.82, 30.80],
    'El Salvador': [13.79, -88.89], 'Equatorial Guinea': [1.65, 10.26], 'Eritrea': [15.17, 39.78],
    'Estonia': [58.59, 25.01], 'Eswatini': [-26.52, 31.46], 'Ethiopia': [9.14, 40.48],
    'Fiji': [-17.71, 178.06], 'Finland': [61.92, 25.74], 'France': [46.22, 2.21],
    'Gabon': [-0.80, 11.60], 'Gambia': [13.44, -15.31], 'Georgia': [42.31, 43.35],
    'Germany': [51.16, 10.45], 'Ghana': [7.94, -1.02], 'Greece': [39.07, 21.82],
    'Guatemala': [15.78, -90.23], 'Guinea': [9.94, -9.69], 'Guyana': [4.86, -58.93],
    'Haiti': [18.97, -72.28], 'Honduras': [15.19, -86.24], 'Hungary': [47.16, 19.50],
    'Iceland': [64.96, -19.02], 'India': [20.59, 78.96], 'Indonesia': [-0.78, 113.92],
    'Iran': [32.42, 53.68], 'Iraq': [33.22, 43.67], 'Ireland': [53.41, -8.24],
    'Israel': [31.04, 34.85], 'Italy': [41.87, 12.56], 'Jamaica': [18.10, -77.29],
    'Japan': [36.20, 138.25], 'Jordan': [30.58, 36.23], 'Kazakhstan': [48.01, 66.92],
    'Kenya': [-0.02, 37.90], 'Kiribati': [1.87, -157.36], 'Kuwait': [29.31, 47.48],
    'Kyrgyzstan': [41.20, 74.76], 'Laos': [19.85, 102.49], 'Latvia': [56.87, 24.60],
    'Lebanon': [33.85, 35.86], 'Lesotho': [-29.60, 28.23], 'Liberia': [6.42, -9.42],
    'Libya': [26.33, 17.22], 'Lithuania': [55.16, 23.88], 'Luxembourg': [49.81, 6.12],
    'Madagascar': [-18.76, 46.86], 'Malawi': [-13.25, 34.30], 'Malaysia': [4.21, 101.97],
    'Maldives': [3.20, 73.22], 'Mali': [17.57, -3.99], 'Malta': [35.93, 14.37],
    'Mauritania': [21.00, -10.94], 'Mauritius': [-20.34, 57.55], 'Mexico': [23.63, -102.55],
    'Moldova': [47.41, 28.36], 'Mongolia': [46.86, 103.84], 'Montenegro': [42.70, 19.37],
    'Morocco': [31.79, -7.09], 'Mozambique': [-18.66, 35.52], 'Myanmar': [21.91, 95.95],
    'Namibia': [-22.95, 18.49], 'Nepal': [28.39, 84.12], 'Netherlands': [52.13, 5.29],
    'New Zealand': [-40.90, 174.88], 'Nicaragua': [12.86, -85.20], 'Niger': [17.60, 8.08],
    'Nigeria': [9.08, 8.67], 'Norway': [60.47, 8.46], 'Oman': [21.51, 55.92],
    'Pakistan': [30.37, 69.34], 'Panama': [8.53, -80.78], 'Papua New Guinea': [-6.31, 143.95],
    'Paraguay': [-23.44, -58.44], 'Peru': [-9.19, -75.01], 'Philippines': [12.87, 121.77],
    'Poland': [51.91, 19.14], 'Portugal': [39.39, -8.22], 'Qatar': [25.35, 51.18],
    'Romania': [45.94, 24.96], 'Russia': [61.52, 105.31], 'Rwanda': [-1.94, 29.87],
    'Saudi Arabia': [23.88, 45.07], 'Senegal': [14.49, -14.45], 'Serbia': [44.01, 21.00],
    'Seychelles': [-4.67, 55.49], 'Sierra Leone': [8.46, -11.77], 'Singapore': [1.35, 103.81],
    'Slovakia': [48.66, 19.69], 'Slovenia': [46.15, 14.99], 'Somalia': [5.15, 46.19],
    'South Africa': [-30.55, 22.93], 'South Korea': [35.90, 127.76], 'Spain': [40.46, -3.74],
    'Sri Lanka': [7.87, 80.77], 'Sudan': [12.86, 30.21], 'Suriname': [3.91, -56.02],
    'Sweden': [60.12, 18.64], 'Switzerland': [46.81, 8.22], 'Syria': [34.80, 38.99],
    'Tajikistan': [38.86, 71.27], 'Tanzania': [-6.36, 34.88], 'Thailand': [15.87, 100.99],
    'Togo': [8.61, 0.82], 'Tonga': [-21.17, -175.19], 'Tunisia': [33.88, 9.53],
    'Turkey': [38.96, 35.24], 'Turkmenistan': [38.96, 59.55], 'Tuvalu': [-7.10, 177.64],
    'UAE': [23.42, 53.84], 'UK': [55.37, -3.43], 'USA': [37.09, -95.71],
    'Uganda': [1.37, 32.29], 'Ukraine': [48.37, 31.16], 'Uruguay': [-32.52, -55.76],
    'Uzbekistan': [41.37, 64.58], 'Vanuatu': [-15.37, 166.95], 'Venezuela': [6.42, -66.58],
    'Vietnam': [14.05, 108.27], 'Yemen': [15.55, 48.51], 'Zambia': [-13.13, 27.84],
    'Zimbabwe': [-19.01, 29.15]
};

function getColor(rate) {
    if (rate >= 40) return '#d73027';
    if (rate >= 30) return '#f46d43';
    if (rate >= 20) return '#fdae61';
    if (rate >= 10) return '#fee08b';
    return '#1a9850';
}

onMount(async () => {
    if (!browser) return;
    try {
        const leafletModule = await import('leaflet');
        L = leafletModule.default || leafletModule;
        await import('leaflet/dist/leaflet.css');

        map = L.map(mapElement).setView([20, 0], 2);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CartoDB'
        }).addTo(map);

        const res = await fetch('/api/v2/child-malnutritions?limit=10000');
        const rawData = await res.json();

        // Tomar el último año disponible por país
        const latestByCountry = {};
        rawData.forEach(d => {
            if (!latestByCountry[d.country] || d.year > latestByCountry[d.country].year) {
                latestByCountry[d.country] = d;
            }
        });

        Object.values(latestByCountry).forEach(d => {
            const coords = countryCoords[d.country];
            if (!coords || d.stunting_rate == null) return;

            const radius = Math.max(5, d.stunting_rate * 0.8);
            const color = getColor(d.stunting_rate);

            L.circleMarker(coords, {
                radius,
                fillColor: color,
                color: '#fff',
                weight: 1,
                fillOpacity: 0.8
            })
            .addTo(map)
            .bindPopup(`
                <b>${d.country}</b> (${d.year})<br>
                🟡 Stunting: <b>${d.stunting_rate}%</b><br>
                🔴 Wasting: <b>${d.wasting_rate ?? 'N/A'}%</b><br>
                🟠 Overweight: <b>${d.overweight_rate ?? 'N/A'}%</b><br>
                🔵 Underweight: <b>${d.underweight_rate ?? 'N/A'}%</b>
            `);
        });

        // Leyenda
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'legend');
            div.style.background = 'white';
            div.style.padding = '10px';
            div.style.borderRadius = '8px';
            div.style.lineHeight = '1.8';
            div.innerHTML = `
                <b>Stunting Rate</b><br>
                <span style="color:#1a9850">●</span> &lt; 10%<br>
                <span style="color:#fee08b">●</span> 10–20%<br>
                <span style="color:#fdae61">●</span> 20–30%<br>
                <span style="color:#f46d43">●</span> 30–40%<br>
                <span style="color:#d73027">●</span> ≥ 40%
            `;
            return div;
        };
        legend.addTo(map);

        isLoading = false;
    } catch (e) {
        errorMessage = 'Error al cargar el mapa: ' + e.message;
        isLoading = false;
    }
});

onDestroy(() => { if (map) map.remove(); });
</script>

<main style="padding: 20px; font-family: sans-serif; max-width: 1200px; margin: auto;">
    <h1>🗺️ Mapa de Malnutrición Infantil</h1>
    <p>Tasa de stunting por país — último año disponible. Haz clic en un país para ver los detalles.</p>

    <a href="/analytics/child-malnutrition"><button>← Volver a la Gráfica</button></a>

    {#if isLoading}<p>Cargando mapa...</p>{/if}
    {#if errorMessage}<p style="color:red">{errorMessage}</p>{/if}

    <div bind:this={mapElement} style="height: 600px; width: 100%; border-radius: 12px; margin-top: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);"></div>
</main>