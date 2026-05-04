<script>
    // @ts-nocheck
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    let happinessData = [];
    let riskData = [];
    let chart;
    let canvas;

    function combineData() {
        const latestHappiness = {};
        happinessData.forEach((d) => {
            if (!latestHappiness[d.country] || d.year > latestHappiness[d.country].year) {
                latestHappiness[d.country] = d;
            }
        });

        const combined = Object.keys(latestHappiness)
            .map((country) => {
                const hInfo = latestHappiness[country];
                const rInfo = riskData.find((r) => 
                    r.entity.toLowerCase() === country.replace(/_/g, ' ').toLowerCase()
                );

                if (rInfo) {
                    const totalDeaths =
                        (rInfo.high_systolic_blood_pressure || 0) +
                        (rInfo.air_pollution || 0) +
                        (rInfo.child_wasting || 0) +
                        (rInfo.household_air_pollution_from_solid_fuels || 0) +
                        (rInfo.high_fasting_plasma_glucose || 0);

                    return {
                        x: hInfo.happiness_score, // Eje X: Felicidad
                        y: totalDeaths,           // Eje Y: Muertes
                        name: country.replace(/_/g, ' ').toUpperCase(),
                        year: hInfo.year
                    };
                }
                return null;
            })
            .filter((d) => d !== null);

        renderChart(combined);
    }

    function renderChart(combinedData) {
        if (chart) chart.destroy();

        const ctx = canvas.getContext('2d');
        chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Países (Felicidad vs Mortalidad)',
                        data: combinedData,
                        backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        pointRadius: 8,
                        pointHoverRadius: 12
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { display: true, text: 'Índice de Felicidad' },
                        beginAtZero: false
                    },
                    y: {
                        title: { display: true, text: 'Total Muertes (Riesgos Metabólicos/Ambientales)' },
                        beginAtZero: true
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const p = context.raw;
                                return `${p.name} (Año: ${p.year})`;
                            },
                            afterLabel: function(context) {
                                const p = context.raw;
                                return `Felicidad: ${p.x}\nMuertes: ${p.y.toLocaleString()}`;
                            }
                        }
                    }
                }
            }
        });
    }

    onMount(async () => {
        try {
            const riskResponse = await fetch('/api/v2/deaths-by-risk-factors');
            const happinessResponse = await fetch('/api/v2/deaths-by-risk-factors/integrations/happiness-indices');
            
            if (riskResponse.ok && happinessResponse.ok) {
                riskData = await riskResponse.json();
                happinessData = await happinessResponse.json();
                combineData();
            }
        } catch (err) {
            console.error('Error en la integración:', err);
        }
    });
</script>

<main>
    <div class="container">
        <h2>Correlación: Felicidad vs. Factores de Riesgo</h2>
        <p class="description">
            Visualización de dispersión para identificar patrones entre el bienestar subjetivo y la mortalidad por riesgos ambientales y de salud.
        </p>
        
        <div class="chart-wrapper">
            <canvas bind:this={canvas}></canvas>
        </div>

        <div class="info-box">
            <p><strong>Análisis de Dispersión:</strong> A diferencia de las gráficas de barras, este modelo de puntos permite identificar <em>clusters</em> de países. Si los puntos se agrupan en la zona inferior derecha, indicaría que mayor felicidad coincide con menor mortalidad por riesgos.</p>
        </div>
    </div>
</main>

<style>
    main {
        margin: 2rem;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .container {
        max-width: 1100px;
        margin: 0 auto;
    }
    h2 {
        text-align: center;
        color: #333;
    }
    .description {
        text-align: center;
        color: #666;
        margin-bottom: 2rem;
    }
    .chart-wrapper {
        position: relative;
        height: 550px;
        width: 100%;
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .info-box {
        margin-top: 2rem;
        padding: 1.5rem;
        background-color: #f8f9fa;
        border-left: 5px solid #ff6384;
        border-radius: 4px;
    }
</style>