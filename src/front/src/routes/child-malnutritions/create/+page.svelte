<script>
    import { goto } from '$app/navigation';

    let API = '/api/v1/child-malnutritions';
    let country = $state('');
    let year = $state('');
    let region = $state('');
    let stunting_rate = $state(0);
    let errorMessage = $state('');

    async function handleAdd() {
        const res = await fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                country,
                year: parseInt(year),
                region,
                stunting_rate: parseFloat(stunting_rate)
            })
        });

        if (res.status === 201) {
            goto('/child-malnutritions');
        } else {
            errorMessage = "Error al añadir: " + res.status;
        }
    }
</script>

<h2>Añadir Nuevo Dato</h2>
{#if errorMessage}<p style="color:red">{errorMessage}</p>{/if}

<form onsubmit={(e) => { e.preventDefault(); handleAdd(); }}>
    <label>País: <input type="text" bind:value={country} required /></label><br>
    <label>Año: <input type="number" bind:value={year} required /></label><br>
    <label>Región: <input type="text" bind:value={region} required /></label><br>
    <label>Stunting: <input type="number" step="any" bind:value={stunting_rate} /></label><br>
    <button type="submit">Guardar</button>
    <button type="button" onclick={() => goto('/child-malnutritions')}>Cancelar</button>
</form>