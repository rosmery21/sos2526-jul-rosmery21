<script>
    import { goto } from '$app/navigation';
    let API = '/api/v1/child-malnutritions';

    let country = $state('');
    let year = $state('');
    let region = $state('');
    let stunting_rate = $state(0);

    async function handleAdd() {
        await fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                country,
                year: parseInt(year),
                region,
                stunting_rate: parseFloat(stunting_rate)
            })
        });
        goto('/child-malnutritions');
    }
</script>

<h2>Añadir Nuevo Dato</h2>
<form onsubmit={(e) => { e.preventDefault(); handleAdd(); }}>
    <input bind:value={country} placeholder="País" required /><br>
    <input type="number" bind:value={year} placeholder="Año" required /><br>
    <input bind:value={region} placeholder="Región" required /><br>
    <input type="number" step="any" bind:value={stunting_rate} placeholder="Stunting Rate" /><br>
    <button type="submit">Guardar</button>
</form>