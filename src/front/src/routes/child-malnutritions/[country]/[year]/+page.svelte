<script>
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    const API = '/api/v1/child-malnutritions';

    let responseStatusCode = $state(0);

    const country = page.params.country;
    const year = page.params.year;

    let resource = $state(null);
    let newRegion = $state('');
    let newStunting = $state(0);

    async function getResource() {
        const response = await fetch(`${API}/${encodeURIComponent(country)}/${year}`);
        responseStatusCode = response.status;
        if (response.ok) {
            resource = await response.json();
            newRegion = resource.region;
            newStunting = resource.stunting_rate;
        }
    }

    async function updateResource() {
        const response = await fetch(`${API}/${encodeURIComponent(country)}/${year}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                country: country,
                year: parseInt(year),
                region: newRegion,
                stunting_rate: parseFloat(newStunting)
            })
        });
        if (response.ok) goto('/child-malnutritions');
    }

    onMount(getResource);
</script>

<h3>Detalles para {country} ({year})</h3>

{#if resource}
    <div>
        <label>Región: <input type="text" bind:value={newRegion} /></label><br>
        <label>Stunting Rate: <input type="number" step="any" bind:value={newStunting} /></label><br>
        <button onclick={updateResource}>Actualizar recurso</button>
        <button onclick={() => goto('/child-malnutritions')}>Cancelar</button>
    </div>
{:else if responseStatusCode === 404}
    <p>No se encontró el recurso para {country} ({year}).</p>
{:else}
    <p>Cargando...</p>
{/if}