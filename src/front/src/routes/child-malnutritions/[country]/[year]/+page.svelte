<script>
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { fade } from 'svelte/transition';

    const API = '/api/v1/child-malnutritions';

    let responseStatusCode = $state(0);
    let feedback = $state({ msg: '', type: '' });

    const country = page.params.country;
    const year = page.params.year;

    let resource = $state(null);
    let newRegion = $state('');
    let newStunting = $state(0);

    function showMsg(m, t) {
        feedback = { msg: m, type: t };
        setTimeout(() => feedback = { msg: '', type: '' }, 5000);
    }

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

        if (response.ok) {
            alert("¡Recurso actualizado con éxito!");
            goto('/child-malnutritions');
        } else {
            if (response.status === 400) {
                showMsg("Los datos introducidos no son válidos. Revisa los campos.", "error");
            } else if (response.status === 404) {
                showMsg(`No existe un recurso para ${country} en el año ${year}.`, "error");
            } else {
                showMsg("Ha ocurrido un error inesperado al intentar actualizar.", "error");
            }
        }
    }

    onMount(getResource);
</script>

{#if feedback.msg}
    <div class="alert {feedback.type}" transition:fade>
        {feedback.msg}
    </div>
{/if}

<h3>Detalles para {country} ({year})</h3>

{#if resource}
    <div class="form-container">
        <label>Región: <input type="text" bind:value={newRegion} /></label><br>
        <label>Stunting Rate: <input type="number" step="any" bind:value={newStunting} /></label><br>
        <button onclick={updateResource}>Actualizar recurso</button>
        <button class="secondary" onclick={() => goto('/child-malnutritions')}>Cancelar</button>
    </div>
{:else if responseStatusCode === 404}
    <p>Error: No se encontró ningún dato para <strong>{country}</strong> en el año <strong>{year}</strong>.</p>
    <button onclick={() => goto('/child-malnutritions')}>Volver al listado</button>
{:else}
    <p>Cargando datos del recurso...</p>
{/if}

<style>
    .alert { padding: 15px; margin-bottom: 20px; color: white; border-radius: 5px; text-align: center; }
    .error { background-color: #dc3545; }
    .success { background-color: #28a745; }
    .secondary { background-color: #6c757d; color: white; margin-left: 10px; }
    .form-container { background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #ddd; }
    input { margin-bottom: 10px; padding: 5px; }
</style>