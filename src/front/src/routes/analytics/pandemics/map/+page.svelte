<script>
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';

    let mapElement;
    let map;
    let L;
    let errorMessage = $state("");
    let isLoading = $state(true);

    const countryCoords = {
        "Algeria": [28.03, 1.66], "Angola": [-11.20, 17.87], "Benin": [9.30, 2.31], 
        "Botswana": [-22.32, 24.68], "Burkina Faso": [12.23, -1.56], "Burundi": [-3.37, 29.91],
        "Cameroon": [7.36, 12.35], "Cape Verde": [16.00, -24.01], "Chad": [15.45, 18.73],
        "Congo": [-0.22, 15.82], "Djibouti": [11.82, 42.59], "Egypt": [26.82, 30.80],
        "Equatorial Guinea": [1.65, 10.26], "Eritrea": [15.17, 39.78], "Ethiopia": [9.14, 40.48],
        "Gabon": [-0.80, 11.60], "Gambia": [13.44, -15.31], "Ghana": [7.94, -1.02],
        "Guinea": [9.94, -9.69], "Ivory Coast": [7.53, -5.54], "Kenya": [-0.02, 37.90],
        "Lesotho": [-29.60, 28.23], "Liberia": [6.42, -9.42], "Libya": [26.33, 17.22],
        "Madagascar": [-18.76, 46.86], "Malawi": [-13.25, 34.30], "Mali": [17.57, -3.99],
        "Mauritania": [21.00, -10.94], "Mauritius": [-20.34, 57.55], "Morocco": [31.79, -7.09],
        "Mozambique": [-18.66, 35.52], "Namibia": [-22.95, 18.49], "Niger": [17.60, 8.08],
        "Nigeria": [9.08, 8.67], "Rwanda": [-1.94, 29.87], "Senegal": [14.49, -14.45],
        "Sierra Leone": [8.46, -11.77], "Somalia": [5.15, 46.19], "South Africa": [-30.55, 22.93],
        "Sudan": [12.86, 30.21], "Tanzania": [-6.36, 34.88], "Togo": [8.61, 0.82],
        "Tunisia": [33.88, 9.53], "Uganda": [1.37, 32.29], "Zambia": [-13.13, 27.84], "Zimbabwe": [-19.01, 29.15],
        "Spain": [40.46, -3.74], "France": [46.22, 2.21], "Italy": [41.87, 12.56],
        "Germany": [51.16, 10.45], "United Kingdom": [55.37, -3.43], "Portugal": [39.39, -8.22],
        "Greece": [39.07, 21.82], "Netherlands": [52.13, 5.29], "Belgium": [50.50, 4.46],
        "Switzerland": [46.81, 8.22], "Sweden": [60.12, 18.64], "Norway": [60.47, 8.46],
        "Denmark": [56.26, 9.50], "Finland": [61.92, 25.74], "Poland": [51.91, 19.14],
        "Austria": [47.51, 14.55], "Ireland": [53.41, -8.24], "Russia": [61.52, 105.31],
        "Ukraine": [48.37, 31.16], "Romania": [45.94, 24.96],
        "United States": [37.09, -95.71], "Canada": [56.13, -106.34], "Mexico": [23.63, -102.55],
        "Brazil": [-14.23, -51.92], "Argentina": [-38.41, -63.61], "Chile": [-35.67, -71.54],
        "Colombia": [4.57, -74.29], "Peru": [-9.19, -75.01], "Venezuela": [6.42, -66.58],
        "Bolivia": [-16.29, -63.58], "Ecuador": [-1.83, -78.18], "Paraguay": [-23.44, -58.44],
        "Uruguay": [-32.52, -55.76], "Cuba": [21.52, -77.78], "Haiti": [18.97, -72.28],
        "Dominican Republic": [18.73, -70.16], "Guatemala": [15.78, -90.23], "Honduras": [15.19, -86.24],
        "China": [35.86, 104.19], "India": [20.59, 78.96], "Japan": [36.20, 138.25],
        "South Korea": [35.90, 127.76], "Indonesia": [-0.78, 113.92], "Thailand": [15.87, 100.99],
        "Vietnam": [14.05, 108.27], "Philippines": [12.87, 121.77], "Pakistan": [30.37, 69.34],
        "Bangladesh": [23.68, 90.35], "Iran": [32.42, 53.68], "Iraq": [33.22, 43.67],
        "Saudi Arabia": [23.88, 45.07], "Israel": [31.04, 34.85], "Turkey": [38.96, 35.24],
        "Afghanistan": [33.93, 67.70],
        "Australia": [-25.27, 133.77], "New Zealand": [-40.90, 174.88], "Papua New Guinea": [-6.31, 143.95]
    };

    onMount(async () => {
        if (!browser) return;

        try {
            const leafletModule = await import('leaflet');
            L = leafletModule.default || leafletModule;
            await import('leaflet/dist/leaflet.css');

            window.L = L;
            await import('leaflet.heat');

            map = L.map(mapElement).setView([20, 0], 2);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);

            const res = await fetch('/api/v2/pandemics?limit=1000');
            const myData = await res.json();

            const heatPoints = [];
            let maxTotal = 0;
            const countryTotals = {};

            myData.forEach(d => {
                const total = (d.polio || 0) + (d.malaria || 0) + (d.hiv_aids || 0) + (d.tuberculosis || 0);
                countryTotals[d.entity] = (countryTotals[d.entity] || 0) + total;
                if (countryTotals[d.entity] > maxTotal) maxTotal = countryTotals[d.entity];
            });

            Object.keys(countryTotals).forEach(country => {
                const coords = countryCoords[country];
                if (coords && countryTotals[country] > 0) {
                    const intensity = Math.max(0.2, countryTotals[country] / (maxTotal || 1));
                    heatPoints.push([coords[0], coords[1], intensity]);

                    
                    L.circleMarker(coords, {
                        radius: 20,          
                        fillColor: "transparent",
                        color: "transparent", 
                        stroke: false
                    })
                    .addTo(map)
                    .bindTooltip(`
                        <div style="font-family: sans-serif; padding: 5px;">
                            <b style="color: #2c3e50; font-size: 14px;">${country}</b><br/>
                            <span style="color: #e74c3c; font-weight: bold;">${countryTotals[country].toLocaleString()} casos</span>
                        </div>
                    `, { sticky: true, opacity: 0.9 });
                }
            });

            if (heatPoints.length > 0) {
                L.heatLayer(heatPoints, {
                    radius: 50,      
                    blur: 15,
                    max: 0.4,        
                    minOpacity: 0.4,
                    gradient: { 0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' }
                }).addTo(map);
            }

            isLoading = false;
        } catch (e) {
            errorMessage = "Fallo al cargar: " + e.message;
            isLoading = false;
        }
    });

    onDestroy(() => { if (map) map.remove(); });
</script>

<main style="padding: 20px; font-family: 'Segoe UI', sans-serif; max-width: 1200px; margin: auto;">
    <div style="text-align: center; margin-bottom: 20px;">
        <h1> Mapa de Calor Interactivo</h1>
        <p>Pasa el ratón sobre las zonas de color para ver los detalles de cada país.</p>
    </div>

    <div style="margin-bottom: 20px; display: flex; gap: 10px; justify-content: center;">
        <a href="/analytics/pandemics"><button>Ver Gráfica</button></a>
        <a href="/pandemics"><button>Volver a la Tabla</button></a>
    </div>

    {#if isLoading} <p style="text-align:center;">Cargando sensores...</p> {/if}
    {#if errorMessage} <p style="color:red; text-align:center;">{errorMessage}</p> {/if}

    <div bind:this={mapElement} id="map-canvas"></div>
</main>

<style>
    #map-canvas {
        height: 600px;
        width: 100%;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        border: 1px solid #eee;
        background: #fff;
    }
    .btn {
        padding: 10px 20px;
        border-radius: 8px;
        border: 1px solid #ddd;
        background: white;
        cursor: pointer;
        font-weight: 600;
        transition: 0.2s;
    }
    .btn:hover { background: #f8f9fa; border-color: #3498db; color: #3498db; }
</style>