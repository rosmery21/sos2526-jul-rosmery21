<script>
    import { onMount } from 'svelte';

    let universities = $state([]);
    let countries = $state([]); 
    let myData = [];
    let loading = $state(true);
    let selectedCountry = $state("Spain");
    let totalDeaths = $state(0);

    async function loadAll() {
        loading = true;
        try {
            const resMy = await fetch(`/api/v2/pandemics?entity=${selectedCountry}`);
            myData = await resMy.json();
            totalDeaths = myData.reduce((acc, cur) => acc + (cur.hiv_aids || 0) + (cur.malaria || 0), 0);

            const resUni = await fetch(`/api/v2/pandemics/integrations/universities?country=${selectedCountry}`);
            universities = await resUni.json();
        } catch (e) {
            console.error("Error cargando datos");
        } finally {
            loading = false;
        }
    }

    async function loadCountries() {
        const res = await fetch('/api/v2/pandemics?limit=20000');
        const data = await res.json();
        countries = [...new Set(data.map(d => d.entity))].sort();
    }

    onMount(async () => {
        await loadCountries();
        await loadAll();
    });
</script>

<main>
    <h1>Integración Textual: Universidades vs Pandemias</h1>

    <div class="controls">
        <a href="/pandemics">
            <button class="btn-data">Volver a la tabla</button>
        </a>

        <label>Selecciona País:</label>
        <select bind:value={selectedCountry} onchange={loadAll}>
            {#each countries as c}
                <option value={c}>{c}</option>
            {/each}
        </select>
        <button onclick={loadAll}>Actualizar</button>
    </div>

    {#if loading}
        <p>Cargando datos...</p>
    {:else}
        <div class="summary">
            <h3>Resumen de Integración para {selectedCountry}</h3>
            <ul>
                <li><strong>Total Muertes registradas:</strong> {totalDeaths.toLocaleString()}</li>
                <li><strong>Número de Universidades:</strong> {universities.length}</li>
            </ul>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Nombre de la Universidad</th>
                    <th>Sitio Web</th>
                </tr>
            </thead>
            <tbody>
                {#each universities.slice(0, 20) as uni}
                <tr>
                    <td>{uni.name}</td>
                    <td>
                        <a href={uni.web_pages[0]} target="_blank">{uni.web_pages[0]}</a>
                    </td>
                </tr>
                {/each}
            </tbody>
        </table>
        <p>(Mostrando las primeras 20 universidades)</p>
    {/if}

    <br>
    <a href="/integrations/pandemics"><button>Volver</button></a>
</main>

<style>
    /* Estilos para que la tabla parezca una tabla */
    table { width: 100%; border-collapse: collapse; margin-top: 10px; background: white; }
    th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
    th { background-color: #eee; font-weight: bold; }
    tr:hover { background-color: #f9f9f9; }
</style>