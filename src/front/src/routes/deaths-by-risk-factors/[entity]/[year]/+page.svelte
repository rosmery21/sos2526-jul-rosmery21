<script>
	// @ts-nocheck

	import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

	const API = '/api/v2/deaths-by-risk-factors';
    let responseStatusCode = $state(0);

	const entity = page.params.entity;
	const year = page.params.year;

    let resource = $state(null);
    let newHighSystolicBloodPressure = $state(0);
    let newAirPollution = $state(0);
    let newChildWasting = $state(0);
    let newHouseholdAirPollutionFromSolidFuels = $state(0);
    let newHighFastingPlasmaGlucose = $state(0);

	// @ts-ignore
	async function getResource() {
		try {
			const response = await fetch(API + `/${encodeURIComponent(entity)}/${year}`, {
				method: 'GET'
			});
            responseStatusCode = response.status;
			if (response.ok) {
				resource = await response.json();

                newHighSystolicBloodPressure = resource.high_systolic_blood_pressure;
                newAirPollution = resource.air_pollution;
                newChildWasting = resource.child_wasting;
                newHouseholdAirPollutionFromSolidFuels = resource.household_air_pollution_from_solid_fuels;
                newHighFastingPlasmaGlucose = resource.high_fasting_plasma_glucose;
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
            // eslint-disable-next-line svelte/no-navigation-without-resolve
            goto('/deaths-by-risk-factors');
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
                    high_systolic_blood_pressure: newHighSystolicBloodPressure,
                    air_pollution: newAirPollution,
                    child_wasting: newChildWasting,
                    household_air_pollution_from_solid_fuels: newHouseholdAirPollutionFromSolidFuels,
                    high_fasting_plasma_glucose: newHighFastingPlasmaGlucose
                })
            });
            responseStatusCode = response.status;
            if (response.ok) {
                console.log(`Updated resource: ${entity} (${year})`);
                // eslint-disable-next-line svelte/no-navigation-without-resolve
                goto('/deaths-by-risk-factors');
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
                <th>Año</th>
                <th>Alta presión arterial</th>
                <th>Contaminación del aire</th>
                <th>Desnutrición infantil</th>
                <th>Contaminación de combustibles fósiles</th>
                <th>Glucosa en sangre</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{entity}</td>
                <td>{year}</td>
                <td><input type="number" bind:value={newHighSystolicBloodPressure} /></td>
                <td><input type="number" bind:value={newAirPollution} /></td>
                <td><input type="number" bind:value={newChildWasting} /></td>
                <td><input type="number" bind:value={newHouseholdAirPollutionFromSolidFuels} /></td>
                <td><input type="number" bind:value={newHighFastingPlasmaGlucose} /></td>
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
