<script>
    // @ts-nocheck
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    const API = '/api/v2/protests';
    let responseStatusCode = $state(0);

    const id = page.params.id;

    let resource = $state(null);
    let newCountry = $state('');
    let newYear = $state(0);
    let newRegion = $state('');
    let newProtest = $state(0);
    let newProtesterviolence = $state(0);
    let newProtesterdemand = $state(0);
    let newStateresponse = $state(0);
    let newElectoral_ecore = $state(0);
    let newLiberal_score = $state(0);
    let newParticipatory_score = $state(0);
    let newDeliberative_score = $state(0);
    let newEgalitarian_score = $state(0);
    let newHdi_score = $state(0);
    let newViolence_status = $state(0);
    let newPredicted_prob = $state(0);

    let errorMessage = $state('');
    let infoMessage = $state('');

    async function getResource() {
        try {
            const response = await fetch(`${API}/${id}`, { method: 'GET' });
            responseStatusCode = response.status;
            if (response.ok) {
                resource = await response.json();
                newCountry = resource.country;
                newYear = resource.year;
                newRegion = resource.region;
                newProtest = resource.protest;
                newProtesterviolence = resource.protesterviolence;
                newProtesterdemand = resource.protesterdemand;
                newStateresponse = resource.stateresponse;
                newElectoral_ecore = resource.electoral_ecore;
                newLiberal_score = resource.liberal_score;
                newParticipatory_score = resource.participatory_score;
                newDeliberative_score = resource.deliberative_score;
                newEgalitarian_score = resource.egalitarian_score;
                newHdi_score = resource.hdi_score;
                newViolence_status = resource.violence_status;
                newPredicted_prob = resource.predicted_prob;
            } else {
                console.error('Failed to fetch resource:', response.status);
            }
        } catch (error) {
            console.error('Error fetching resource:', error);
        }
    }

    async function deleteResource() {
        if (!confirm(`¿Estás seguro de que deseas eliminar el recurso con id: ${id}?`)) return;
        try {
            const response = await fetch(`${API}/${id}`, { method: 'DELETE' });
            responseStatusCode = response.status;
            if (response.ok) {
                errorMessage = '';
                infoMessage = `Eliminado correctamente, volviendo a la página principal...`;

                await returnToMainPage();
            } else {
                console.error('Failed to delete resource:', response.status);
                errorMessage = 'Error al eliminar el recurso';
            }
        } catch (error) {
            console.error('Error deleting resource:', error);
        }
    }

    async function updateResource() {
        try {
            const response = await fetch(`${API}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: Number(id),
                    country: newCountry,
                    year: newYear,
                    region: newRegion,
                    protest: newProtest,
                    protesterviolence: newProtesterviolence,
                    protesterdemand: newProtesterdemand,
                    stateresponse: newStateresponse,
                    electoral_ecore: newElectoral_ecore,
                    liberal_score: newLiberal_score,
                    participatory_score: newParticipatory_score,
                    deliberative_score: newDeliberative_score,
                    egalitarian_score: newEgalitarian_score,
                    hdi_score: newHdi_score,
                    violence_status: newViolence_status,
                    predicted_prob: newPredicted_prob
                })
            });
            console.log(response);
            responseStatusCode = response.status;
            if (response.ok) {
                errorMessage = '';
                infoMessage = `Actualizado correctamente, volviendo a la página principal...`;
                await returnToMainPage();
            } else {
                console.error('Failed to update resource:', response.status);
                errorMessage = 'Debe rellenar todos los parámetros correctamente';
            }
        } catch (error) {
            console.error('Error updating resource:', error);
        }
    }

    async function returnToMainPage() {
        await new Promise(resolve => setTimeout(resolve, 2000));
        infoMessage = '';
        goto('/protests', { invalidateAll: true });
    }

    onMount(getResource);
</script>

{#if infoMessage}
    <h1 style="color: green;">{infoMessage}</h1>
{:else if errorMessage}
    <p style="color: red;">{errorMessage}</p>
{/if}

<h3>Detalles para protesta #{id}</h3>

{#if resource}
    <form onsubmit={(e) => { e.preventDefault(); updateResource(); }}>
        <div>
            <label>
                País
                <input type="text" bind:value={newCountry} />
            </label>
        </div>

        <div>
            <label>
                Año
                <input type="number" bind:value={newYear} />
            </label>
        </div>

        <div>
            <label>
                Región
                <input type="text" bind:value={newRegion} />
            </label>
        </div>

        <div>
            <label>
                Protesta
                <input type="number" min="0" max="1" bind:value={newProtest} />
            </label>
        </div>

        <div>
            <label>
                Violencia manifestantes
                <input type="number" min="0" max="1" bind:value={newProtesterviolence} />
            </label>
        </div>

        <div>
            <label>
                Demanda manifestantes
                <input type="text" bind:value={newProtesterdemand} />
            </label>
        </div>

        <div>
            <label>
                Respuesta del estado
                <input type="text" bind:value={newStateresponse} />
            </label>
        </div>

        <div>
            <label>
                Score electoral
                <input type="number" min="0" max="1" step="0.001" bind:value={newElectoral_ecore} />
            </label>
        </div>

        <div>
            <label>
                Score liberal
                <input type="number" min="0" max="1" step="0.001" bind:value={newLiberal_score} />
            </label>
        </div>

        <div>
            <label>
                Score participativo
                <input type="number" min="0" max="1" step="0.001" bind:value={newParticipatory_score} />
            </label>
        </div>

        <div>
            <label>
                Score deliberativo
                <input type="number" min="0" max="1" step="0.001" bind:value={newDeliberative_score} />
            </label>
        </div>

        <div>
            <label>
                Score igualitario
                <input type="number" min="0" max="1" step="0.001" bind:value={newEgalitarian_score} />
            </label>
        </div>

        <div>
            <label>
                Score HDI
                <input type="number" min="0" max="1" step="0.001" bind:value={newHdi_score} />
            </label>
        </div>

        <div>
            <label>
                Estado de violencia
                <input type="number" min="0" max="1" bind:value={newViolence_status} />
            </label>
        </div>

        <div>
            <label>
                Prob. predicha
                <input type="number" min="0" max="1" step="0.000000000000001" bind:value={newPredicted_prob} />
            </label>
        </div>

        <button onclick={deleteResource}>Eliminar recurso</button>
        <button type="submit">Actualizar recurso</button>
    </form>


{:else if responseStatusCode === 404}
    <p>No se encontró el recurso con id: {id}.</p>
{:else}
    <p>Cargando detalles para la protesta #{id}...</p>
{/if}