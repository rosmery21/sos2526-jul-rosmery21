<script>
  import { goto } from '$app/navigation';

  let country = $state('');
  let year = $state('');
  let region = $state('');
  let stunting_rate = $state('');

  const API = '/api/v2/child-malnutritions';

  async function save() {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country, year: Number(year), region, stunting_rate: parseFloat(stunting_rate) })
    });
    if (res.ok || res.status === 201) {
      await goto('/child-malnutritions');
    }
  }
</script>

<main>
  <h2>Crear dato</h2>
  <input placeholder="País" bind:value={country} />
  <input placeholder="Año" bind:value={year} />
  <input placeholder="Región" bind:value={region} />
  <input placeholder="Tasa Stunting %" bind:value={stunting_rate} />
  <button onclick={save}>Guardar</button>
</main>