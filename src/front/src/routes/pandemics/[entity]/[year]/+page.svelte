<script>
    // @ts-nocheck
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    const API = '/api/v2/pandemics';
    let responseStatusCode = $state(0);
    let statusMsg = $state(""); 

    const entity = page.params.entity;
    const year = page.params.year;

    let resource = $state(null);
    let code = $state(""); 
    let newYaws = $state(0);
    let newPolio = $state(0);
    let newGuineaWorm = $state(0);
    let newRabies = $state(0);
    let newMalaria = $state(0);
    let newHivAids = $state(0);
    let newTuberculosis = $state(0);
    let newSmallpox = $state(0);
    let newCholera = $state(0);

    async function getResource() {
        try {
            const response = await fetch(API + `/${encodeURIComponent(entity)}/${year}`);
            responseStatusCode = response.status;
            if (response.ok) {
                resource = await response.json();
                code = resource.code;
                newYaws = resource.yaws;
                newPolio = resource.polio;
                newGuineaWorm = resource.guinea_worm;
                newRabies = resource.rabies;
                newMalaria = resource.malaria;
                newHivAids = resource.hiv_aids;
                newTuberculosis = resource.tuberculosis;
                newSmallpox = resource.smallpox;
                newCholera = resource.cholera;
            }
        } catch (error) {
            console.error('Error fetching resource:', error);
        }
    }

    async function updateResource() {
        // --- VALIDACIÓN ANTI-NEGATIVOS ---
        const values = [newYaws, newPolio, newGuineaWorm, newRabies, newMalaria, newHivAids, newTuberculosis, newSmallpox, newCholera];
        if (values.some(v => v < 0)) {
            statusMsg = "Error: No se permiten valores negativos.";
            return; // No sigue con el envío
        }

        try {
            const updatedData = {
                entity: entity,
                code: code,
                year: parseInt(year),
                yaws: Number(newYaws),
                polio: Number(newPolio),
                guinea_worm: Number(newGuineaWorm),
                rabies: Number(newRabies),
                malaria: Number(newMalaria),
                hiv_aids: Number(newHivAids),
                tuberculosis: Number(newTuberculosis),
                smallpox: Number(newSmallpox),
                cholera: Number(newCholera)
            };

            const response = await fetch(`${API}/${encodeURIComponent(entity)}/${year}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            
            responseStatusCode = response.status;
            if (response.ok) {
                statusMsg = "¡Actualizado con éxito!";
                setTimeout(() => goto('/pandemics'), 1500);
            } else {
                const errorText = await response.text();
                statusMsg = "Error del servidor: " + errorText;
            }
        } catch (error) {
            statusMsg = "Error de conexión";
        }
    }

    onMount(getResource);
</script>

<main>
    <h3>Detalles para {entity} ({year})</h3>

    {#if statusMsg}
        <p style="color: {statusMsg.includes('❌') ? 'red' : 'blue'}; font-weight: bold;">{statusMsg}</p>
    {/if}

    {#if resource}
        <table>
            <thead>
                <tr>
                    <th>País</th><th>Año</th><th>Frambesia</th><th>Polio</th>
                    <th>Gusano</th><th>Rabia</th><th>Malaria</th><th>VIH</th>
                    <th>TBC</th><th>Viruela</th><th>Cólera</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{entity}</td>
                    <td>{year}</td>
                    <td><input type="number" step="any" min="0" bind:value={newYaws} /></td>
                    <td><input type="number" step="any" min="0" bind:value={newPolio} /></td>
                    <td><input type="number" step="any" min="0" bind:value={newGuineaWorm} /></td>
                    <td><input type="number" step="any" min="0" bind:value={newRabies} /></td>
                    <td><input type="number" step="any" min="0" bind:value={newMalaria} /></td>
                    <td><input type="number" step="any" min="0" bind:value={newHivAids} /></td>
                    <td><input type="number" step="any" min="0" bind:value={newTuberculosis} /></td>
                    <td><input type="number" step="any" min="0" bind:value={newSmallpox} /></td>
                    <td><input type="number" step="any" min="0" bind:value={newCholera} /></td>
                </tr>
            </tbody>
        </table> 

        <div style="margin-top: 20px;">
            <button onclick={updateResource}>Actualizar dato</button>
            <button onclick={() => goto('/pandemics')}>Cancelar</button>
        </div>

    {:else if responseStatusCode === 404}
        <p>No se encontró el dato para {entity} ({year}).</p>
    {:else}
        <p>Cargando detalles...</p>
    {/if}
</main>

<style>
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
    input { width: 60px; }
    button { cursor: pointer; padding: 8px; margin-right: 5px; }
</style>