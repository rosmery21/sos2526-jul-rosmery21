<script>
    import { goto } from '$app/navigation';
    import { fade } from 'svelte/transition';

    let API = '/api/v1/child-malnutritions';
    let feedback = $state({ msg: '', type: '' });

    let country = $state('');
    let year = $state('');
    let region = $state('');
    let stunting_rate = $state(0);

    function showMsg(m, t) {
        feedback = { msg: m, type: t };
        setTimeout(() => feedback = { msg: '', type: '' }, 5000);
    }

    async function handleAdd() {
        const response = await fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                country,
                year: parseInt(year),
                region,
                stunting_rate: parseFloat(stunting_rate)
            })
        });

        if (response.ok) {
            alert(`¡El recurso de ${country} se ha creado correctamente!`);
            goto('/child-malnutritions');
        } else {
            if (response.status === 409) {
                showMsg(`Error: Ya existe un registro para ${country} en el año ${year}.`, "error");
            } else if (response.status === 400) {
                showMsg("Error: Asegúrate de que todos los campos estén rellenos correctamente.", "error");
            } else {
                showMsg("No se ha podido guardar el dato. Inténtalo de nuevo más tarde.", "error");
            }
        }
    }
</script>

{#if feedback.msg}
    <div class="alert {feedback.type}" transition:fade>
        {feedback.msg}
    </div>
{/if}

<h2>Añadir Nuevo Dato</h2>
<form novalidate onsubmit={(e) => { e.preventDefault(); handleAdd(); }}> class="form-container">
    <input bind:value={country} placeholder="País (ej. Spain)" required /><br>
    <input type="number" bind:value={year} placeholder="Año (ej. 2024)" required /><br>
    <input bind:value={region} placeholder="Región" required /><br>
    <input type="number" step="any" bind:value={stunting_rate} placeholder="Tasa de retraso (%)" /><br>
    <button type="submit" style="background-color: #28a745; color: white;">Guardar Recurso</button>
    <button type="button" class="secondary" onclick={() => goto('/child-malnutritions')}>Volver</button>
</form>

<style>
    .alert { padding: 15px; margin-bottom: 20px; color: white; border-radius: 5px; text-align: center; }
    .error { background-color: #dc3545; }
    .form-container { background: #f4f4f4; padding: 20px; border-radius: 8px; }
    input { margin-bottom: 10px; width: 100%; max-width: 300px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
    .secondary { background-color: #6c757d; color: white; margin-left: 10px; }
</style>