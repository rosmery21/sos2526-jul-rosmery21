<script>
// @ts-nocheck

    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import * as echarts from "echarts";

    let POKE_API = "/api/v2/protests/proxy/pokeapi";


    let pokemon = $state([]);
    let loading = $state(true);
    let error = $state(null);
    let selectedPokemon = $state(null);

    let chartContainer;
    let chart;

    async function loadPokedata() {
        try {
            const response = await fetch(POKE_API);
            const data = await response.json();
            
            // Nombre de los pokemons
            pokemon = data.results.map(p => p.name);
        } catch (err) {
            console.error("Error fetching Pokémon data:", err);
            error = "Fallo al cargar datos de Pokémon";
        }
    }

    async function handlePokemonChange() {
        loading = true;

        const select = document.querySelector("select");
        selectedPokemon = select.value;

        let selectedPokemonData = await fetch(`${POKE_API}/${selectedPokemon}`).then(res => res.json());
        console.log("Datos del Pokémon seleccionado:", selectedPokemonData);

        const stats = selectedPokemonData.stats;

        const labels = stats.map(s => s.stat.name);

        const values = stats.map(s => s.base_stat);

        loading = false;
        
        chart.setOption({
            title: {
                text: selectedPokemon.toUpperCase()
            },

            tooltip: {},

            radar: {
                indicator: labels.map(label => ({
                    name: label,
                    max: 200
                }))
            },

            series: [
                {
                    name: selectedPokemon,
                    type: "radar",

                    data: [
                        {
                            value: values
                        }
                    ]
                }
            ]
        });
    }

    onMount(() => {
        loadPokedata().then(() => loading = false);

        chart = echarts.init(chartContainer);
    });
</script>

{#if loading}
    <p>Cargando datos de Pokémon...</p>
{:else if error}
    <p>{error}</p>
{:else}
    <select onchange={() => handlePokemonChange()}>
        <option value="">Selecciona un Pokémon</option>
        {#each pokemon as p (p)}
            <option value={p}>{p}</option>
        {/each}
    </select>
    {#if selectedPokemon}
        <p>Pokémon seleccionado: {selectedPokemon}</p>
    {/if}
{/if}
<button onclick={() => goto('/integrations/protests')}>Volver</button>
<div bind:this={chartContainer} style="width: 800px; height: 600px;"></div>