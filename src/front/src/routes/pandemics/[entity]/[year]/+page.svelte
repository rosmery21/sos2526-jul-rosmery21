<script>
	// @ts-nocheck

	import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

	const API = '/api/v1/pandemics';
    let responseStatusCode = $state(0);

	const entity = page.params.entity;
	const year = page.params.year;

    let resource = $state(null);
    let newYaws = $state(0);
    let newPolio = $state(0);
    let newGuineaWorm = $state(0);
    let newRabies = $state(0);
    let newMalaria = $state(0);
    let newHivAids = $state(0);
    let newTuberculosis = $state(0);
    let newSmallpox = $state(0);
    let newCholera = $state(0);


   

	// @ts-ignore
	async function getResource() {
		try {
			const response = await fetch(API + `/${encodeURIComponent(entity)}/${year}`, {
				method: 'GET'
			});
            responseStatusCode = response.status;
			if (response.ok) {
				resource = await response.json();

                newYaws = resource.yaws;
                newPolio = resource.polio;
                newGuineaWorm = resource.guinea_worm;
                newRabies = resource.rabies;
                newMalaria = resource.malaria;
                newHivAids = resource.hiv_aids;
                newTuberculosis = resource.tuberculosis;
                newSmallpox = resource.smallpox;
                newCholera = resource.cholera;
			} else {
				console.error('Failed to fetch resource:', response.status);
				return null;
			}
		} catch (error) {
			console.error('Error fetching resource:', error);
			return null;
		}
	}

	async function deleteResource(entity, year) {
		if (!confirm(`¿Estás seguro de que deseas eliminar el recurso: ${entity} (${year})?`)) {
			return;
		}
		try {
			const response = await fetch(`${API}/${encodeURIComponent(entity)}/${year}`, {
				method: 'DELETE'
			});
			responseStatusCode = response.status;
			if (response.ok) {
				console.log(`Deleted resource: ${entity} (${year})`);
			} else {
				console.error('Failed to delete resource:', response.status);
			}
		} catch (error) {
			console.error('Error deleting resource:', error);
		}
	}

    async function updateResource(entity, year) {
        try {
            const response = await fetch(`${API}/${encodeURIComponent(entity)}/${year}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    entity: entity,
                    year: year,
                    yaws: newYaws,
                    polio: newPolio,
                    guinea_worm: newGuineaWorm,
                    rabies: newRabies,
                    malaria: newMalaria,
                    hiv_aids: newHivAids,
                    tuberculosis: newTuberculosis,
                    smallpox: newSmallpox,
                    cholera: newCholera
                })
            });
            responseStatusCode = response.status;
            if (response.ok) {
                console.log(`Updated resource: ${entity} (${year})`);
                // eslint-disable-next-line svelte/no-navigation-without-resolve
                goto('/pandemics');
            } else {
                console.error('Failed to update resource:', response.status);
            }
        } catch (error) {
            console.error('Error updating resource:', error);
        }
    }

    onMount(getResource);
</script>

<h3>Detalles para {entity} ({year})</h3>

{#if resource}
    <table>
        <thead>
            <tr>
                <th>País</th>
                <th>Código</th>
                <th>Año</th>
                <th>Frambesia</th>
                <th>Polio</th>
                <th>Gusano de Guinea</th>
                <th>Rabia</th>
                <th>Malaria</th>
                <th>VIH/SIDA</th>
                <th>Tuberculosis</th>
                <th>Viruela</th>
                <th>Cólera</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{entity}</td>
                <td>{year}</td>
                <td><input type="number" bind:value={newYaws} /></td>
                <td><input type="number" bind:value={newPolio} /></td>
                <td><input type="number" bind:value={newGuineaWorm} /></td>
                <td><input type="number" bind:value={newRabies} /></td>
                <td><input type="number" bind:value={newMalaria} /></td>
                <td><input type="number" bind:value={newHivAids} /></td>
                <td><input type="number" bind:value={newTuberculosis} /></td>
                <td><input type="number" bind:value={newSmallpox} /></td>
                <td><input type="number" bind:value={newCholera} /></td>
            </tr>
        </tbody>
    </table>

    <button onclick={() => deleteResource(resource.entity, resource.year)}>Eliminar recurso</button>
    <button onclick={() => updateResource(resource.entity, resource.year)}>Actualizar recurso</button>

{:else if responseStatusCode === 404}
    <p>No se encontró el recurso para {entity} ({year}). Código de respuesta: {responseStatusCode}</p>
{:else}
    <p>Cargando detalles para {entity} ({year})...</p>
{/if}